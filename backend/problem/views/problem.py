from dataclasses import asdict, dataclass
from typing import TypedDict

from django.http import JsonResponse
from rest_framework.views import APIView

from langpro_annotator.logger import logger
from problem.problem_details import get_filters, get_related_problem_ids
from problem.models import KnowledgeBase, Problem, Sentence


@dataclass
class ProblemResponse:
    problem: Problem | None = None
    index: int | None = None
    error: str | None = None

    first: str | None = None
    previous: str | None = None
    next: str | None = None
    last: str | None = None
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
    id: str | None = None
    error: str | None = None

    def json_response(self, status=200) -> JsonResponse:
        return JsonResponse(asdict(self), status=status)


class ProblemView(APIView):
    def get(self, request, problem_id: str | None = None) -> JsonResponse:
        """
        If a Problem ID is provided, attempts to retrieve the requested Problem. Otherwise, simply returns the first problem of the QS.
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

    def post(self, request, problem_id: str) -> JsonResponse:
        """
        If the Problem ID is "new", attempts to create a new Problem;
        else the associated Problem is updated.
        """
        parse_input = request.data

        try:
            validated_input = validate_input(parse_input)
        except ValueError as e:
            logger.error(f"Input validation error: {e}")
            return SaveProblemResponse(
                id=None,
                error=str(e),
            ).json_response(status=400)

        problem: Problem | None = None
        error: str | None = None

        if problem_id == "new":
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
                error=error,
            ).json_response(status=500)

        return SaveProblemResponse(id=problem.pk, error=None).json_response()


class KBItem(TypedDict):
    id: str
    entity1: str
    relationship: str
    entity2: str


class ParseInput(TypedDict):
    id: str
    premises: list[str]
    hypothesis: str
    kbItems: list[KBItem]


def validate_input(parse_input: dict) -> ParseInput:
    """
    Validate the parse input data.
    """
    if not isinstance(parse_input, dict):
        raise ValueError("Input must be a dictionary")

    if "id" not in parse_input or not isinstance(parse_input["id"], str):
        raise ValueError("Missing or invalid 'id' field")

    if "premises" not in parse_input or not isinstance(parse_input["premises"], list):
        raise ValueError("Missing or invalid 'premises' field")

    if "hypothesis" not in parse_input or not isinstance(
        parse_input["hypothesis"], str
    ):
        raise ValueError("Missing or invalid 'hypothesis' field")

    if "kbItems" not in parse_input or not isinstance(parse_input["kbItems"], list):
        raise ValueError("Missing or invalid 'kbItems' field")

    for item in parse_input["kbItems"]:
        if not isinstance(item, dict):
            raise ValueError("Each kbItem must be a dictionary")
        if "id" not in item or not isinstance(item["id"], str):
            raise ValueError("Missing or invalid 'id' in kbItem")
        if "entity1" not in item or not isinstance(item["entity1"], str):
            raise ValueError("Missing or invalid 'entity1' in kbItem")
        if "relationship" not in item or not isinstance(item["relationship"], str):
            raise ValueError("Missing or invalid 'relationship' in kbItem")
        if item["relationship"] not in KnowledgeBase.Relationship.values:
            raise ValueError(f"Invalid 'relationship' in kbItem.")
        if "entity2" not in item or not isinstance(item["entity2"], str):
            raise ValueError("Missing or invalid 'entity2' in kbItem")

    return ParseInput(
        id=parse_input["id"],
        premises=parse_input["premises"],
        hypothesis=parse_input["hypothesis"],
        kbItems=parse_input["kbItems"],
    )


def create_problem_from_input(parse_input: ParseInput) -> Problem:
    """
    Save a new Problem instance from the given parse input data.
    """
    try:
        premise_sentences = [
            Sentence.objects.get_or_create(text=premise)[0] for premise in parse_input["premises"]
        ]
    except Exception as e:
        raise ValueError(f"Error creating premise sentences: {e}")

    try:
        hypothesis_sentence = Sentence.objects.get_or_create(text=parse_input["hypothesis"])[0]
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


def update_or_create_kb_items(problem: Problem, kb_items: list[KBItem]) -> None:
    kb_ids: list[str] = []
    for item in kb_items:
        id = item.get("id")
        entity1 = item.get("entity1")
        relationship = item.get("relationship")
        entity2 = item.get("entity2")

        if id == "new":
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


def update_problem_from_input(parse_input: ParseInput) -> Problem:
    try:
        problem = Problem.objects.get(id=parse_input["id"])
    except Problem.DoesNotExist:
        raise ValueError(f"Cannot find Problem with ID: {parse_input["id"]}")

    problem.hypothesis = Sentence.objects.get_or_create(text=parse_input["hypothesis"])[
        0
    ]

    premises: list[Sentence] = []
    for input_premise in parse_input["premises"]:
        premise = Sentence.objects.get_or_create(text=input_premise)[0]
        premises.append(premise)

    problem.premises.set(premises)

    update_or_create_kb_items(problem, parse_input["kbItems"])

    return problem
