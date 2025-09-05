from dataclasses import asdict, dataclass
from typing import TypedDict

from django.http import JsonResponse
from rest_framework.views import APIView

from langpro_annotator.logger import logger
from problem.problem_details import get_filters, get_related_problem_ids
from problem.models import KnowledgeBase, Problem, Sentence


@dataclass
class ProblemResponse:
    id: int | None = None
    index: int | None = None
    problem: Problem | None = None
    error: str | None = None

    first: str | None = None
    previous: str | None = None
    next: str | None = None
    last: str | None = None
    total: int | None = None

    def json_response(self, status=200) -> JsonResponse:
        return JsonResponse(
            {
                "id": self.id,
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
    def get(self, request, problem_id: int | None = None) -> JsonResponse:
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
            id=problem.pk if problem else None,
            index=problem_index,
            problem=problem,
            first=related_problem_ids.first,
            previous=related_problem_ids.previous,
            next=related_problem_ids.next,
            last=related_problem_ids.last,
            total=related_problem_ids.total,
        ).json_response(status=200)

    def post(self, request) -> JsonResponse:
        parse_input = request.data

        try:
            validated_input = validate_input(parse_input)
        except ValueError as e:
            logger.error(f"Input validation error: {e}")
            return SaveProblemResponse(
                id=None,
                error=str(e),
            ).json_response(status=400)

        try:
            problem = create_problem_from_input(validated_input)
        except Exception as e:
            logger.exception(f"Error saving problem: {e}")
            return SaveProblemResponse(
                id=None,
                error=str(e),
            ).json_response(status=500)

        return SaveProblemResponse(
            id=str(problem.pk),
            error=None,
        ).json_response()


class KBItem(TypedDict):
    entity1: str
    relationship: str
    entity2: str


class ParseInput(TypedDict):
    premises: list[str]
    hypothesis: str
    kbItems: list[KBItem]


def validate_input(parse_input: dict) -> ParseInput:
    """
    Validate the parse input data.
    """
    if not isinstance(parse_input, dict):
        raise ValueError("Input must be a dictionary")

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
        if "entity1" not in item or not isinstance(item["entity1"], str):
            raise ValueError("Missing or invalid 'entity1' in kbItem")
        if "relationship" not in item or not isinstance(item["relationship"], str):
            raise ValueError("Missing or invalid 'relationship' in kbItem")
        if item["relationship"].lower() not in KnowledgeBase.Relationship.values:
            raise ValueError(f"Invalid 'relationship' in kbItem.")
        if "entity2" not in item or not isinstance(item["entity2"], str):
            raise ValueError("Missing or invalid 'entity2' in kbItem")

    return ParseInput(
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
            Sentence.objects.create(text=premise) for premise in parse_input["premises"]
        ]
    except Exception as e:
        raise ValueError(f"Error creating premise sentences: {e}")

    try:
        hypothesis_sentence = Sentence.objects.create(text=parse_input["hypothesis"])
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

    for item in parse_input["kbItems"]:
        entity1 = item.get("entity1")
        relationship = item.get("relationship")
        entity2 = item.get("entity2")

        try:
            knowledge_base = KnowledgeBase.objects.create(
                entity1=entity1,
                relationship=relationship.lower(),
                entity2=entity2,
                problem=problem,
            )
        except Exception as e:
            raise ValueError(f"Error creating knowledge base items: {e}")

    return problem
