from dataclasses import asdict, dataclass

from django.http import JsonResponse
from rest_framework.views import APIView

from langpro_annotator.logger import logger
from problem.problem_details import get_filters, get_related_problem_ids
from problem.models import KnowledgeBase, Problem, Sentence
from problem.serializers import ProblemInputSerializer


@dataclass
class ProblemResponse:
    problem: Problem | None = None
    index: int | None = None
    error: str | None = None

    first: int | None = None
    previous: int | None = None
    next: int | None = None
    last: int | None = None
    total: int | None = None

    def json_response(self, status=200) -> JsonResponse:
        return JsonResponse(
            {
                "index": self.index,
                "problem": self.problem.serialize() if self.problem else None,
                "error": self.error,
                "firstProblemId": self.first,
                "previousProblemId": self.previous,
                "nextProblemId": self.next,
                "lastProblemId": self.last,
                "totalProblems": self.total if self.total is not None else 0,
            },
            status=status,
        )


@dataclass
class SaveProblemResponse:
    id: int | None = None
    error: dict | None = None

    def json_response(self, status=200) -> JsonResponse:
        return JsonResponse(asdict(self), status=status)


class ProblemView(APIView):
    def get(self, request, problem_id: int | None = None) -> JsonResponse:
        """
        If a Problem ID is provided, retrieves the requested Problem.
        Otherwise, simply returns the first problem of the QS.
        """
        filters = get_filters(request.query_params)

        qs = Problem.objects.all()

        if filters is not None:
            qs = qs.filter(filters)

        problem = None
        if problem_id is not None:
            try:
                problem = qs.get(id=problem_id)
            except Problem.DoesNotExist:
                # The selected problem may not be part of the selected filters.
                # In that case, we simply take the first problem from the queryset.
                pass

        if problem is None:
            problem = qs.first()

        problem_index = problem.get_index(qs) if problem else None
        related_problem_ids = get_related_problem_ids(qs, problem_id)

        return ProblemResponse(
            problem=problem,
            index=problem_index,
            first=related_problem_ids.first,
            previous=related_problem_ids.previous,
            next=related_problem_ids.next,
            last=related_problem_ids.last,
            total=related_problem_ids.total,
        ).json_response(status=200)

    def post(self, request, problem_id: int | None = None) -> JsonResponse:
        """
        If the Problem ID is None, attempts to create a new Problem;
        else the associated Problem is updated.
        """
        serializer = ProblemInputSerializer(data=request.data)

        if not serializer.is_valid():
            logger.error(f"Input validation error: {serializer.errors}")
            return SaveProblemResponse(
                id=None,
                error=dict(serializer.errors),  # type: ignore
            ).json_response(status=400)

        validated_input: dict = serializer.validated_data  # type: ignore

        problem: Problem | None = None
        error: str | None = None

        if problem_id is None:
            try:
                problem = create_problem_from_input(validated_input)
            except Exception as e:
                error = f"Error creating problem: {str(e)}"
        else:
            try:
                problem = update_problem_from_input(validated_input)
            except Exception as e:
                error = f"Error updating problem: {str(e)}"

        if problem is None or error is not None:
            return SaveProblemResponse(
                id=None,
                error={"message": error},
            ).json_response(status=500)

        return SaveProblemResponse(id=problem.pk, error=None).json_response()


def create_problem_from_input(parse_input: dict) -> Problem:
    """
    Save a new Problem instance from the given parse input data.
    """
    try:
        premise_sentences = [
            Sentence.objects.get_or_create(text=premise)[0]
            for premise in parse_input["premises"]
        ]
    except Exception as e:
        raise ValueError(f"Error creating premise sentences: {e}")

    try:
        hypothesis_sentence = Sentence.objects.get_or_create(
            text=parse_input["hypothesis"]
        )[0]
    except Exception as e:
        raise ValueError(f"Error creating hypothesis sentence: {e}")

    problem = Problem.objects.create(
        hypothesis=hypothesis_sentence,
        dataset=Problem.Dataset.USER,
        # TODO: Determine entailment label based on LangPro parser output.
        entailment_label=Problem.EntailmentLabel.UNKNOWN,
        extra_data={},
    )

    problem.premises.set(premise_sentences)

    update_or_create_kb_items(problem=problem, kb_items=parse_input["kbItems"])

    return problem


def update_or_create_kb_items(problem: Problem, kb_items: list[dict]) -> None:
    kb_ids: list[str] = []
    for item in kb_items:
        id = item["id"]
        entity1 = item["entity1"]
        relationship = item["relationship"]
        entity2 = item["entity2"]

        if id is None:
            try:
                kb = KnowledgeBase.objects.create(
                    entity1=entity1,
                    relationship=relationship,
                    entity2=entity2,
                    problem=problem,
                )
                kb_ids.append(kb.pk)
            except Exception as e:
                raise ValueError(f"Error creating knowledge base items: {e}.")
        else:
            try:
                kb = KnowledgeBase.objects.get(id=id, problem_id=problem.pk)
            except KnowledgeBase.DoesNotExist:
                raise ValueError(f"Unable to find knowledge base item with id {id}.")
            kb.entity1 = entity1
            kb.relationship = relationship
            kb.entity2 = entity2
            kb.save()
            kb_ids.append(kb.pk)

    # Delete existing knowledge bases associated to this problem that are
    # not included in the input.
    KnowledgeBase.objects.filter(problem_id=problem.pk).exclude(id__in=kb_ids).delete()


def update_problem_from_input(parse_input: dict) -> Problem:
    try:
        problem = Problem.objects.get(
            id=parse_input["id"], dataset=Problem.Dataset.USER
        )
    except Problem.DoesNotExist:
        raise ValueError(f"Cannot find Problem with ID: {parse_input["id"]}")

    problem.hypothesis = Sentence.objects.get_or_create(text=parse_input["hypothesis"])[
        0
    ]
    problem.save()

    premises: list[Sentence] = []
    for input_premise in parse_input["premises"]:
        premise = Sentence.objects.get_or_create(text=input_premise)[0]
        premises.append(premise)

    problem.premises.set(premises)

    update_or_create_kb_items(problem, parse_input["kbItems"])

    return problem
