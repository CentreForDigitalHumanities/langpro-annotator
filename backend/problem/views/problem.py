from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.status import HTTP_201_CREATED, HTTP_200_OK

from problem.problem_details import (
    get_filters,
    get_related_problem_ids,
)
from problem.models import KnowledgeBase, Problem, Sentence
from problem.serializers import ProblemInputSerializer, ProblemSerializer


class ProblemView(ModelViewSet):
    queryset = Problem.objects.all()
    serializer_class = ProblemSerializer

    def list(self, request: Request) -> Response:
        """
        Lists all Problems in the database, with optional filtering.
        """
        filters = get_filters(request.query_params)

        qs = self.get_queryset()

        if filters is not None:
            qs = qs.filter(filters)

        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data, status=HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="first")
    def first(self, request: Request) -> Response:
        """
        Retrieves the first problem from the queryset.
        """
        return self._get_problem_response(request, pk=None)

    def retrieve(self, request: Request, pk: int | None = None) -> Response:
        """
        Retrieves the requested Problem by ID.
        """
        return self._get_problem_response(request, pk=pk)

    def _get_problem_response(self, request: Request, pk: int | None) -> Response:
        """
        Helper method to build the problem response.
        If pk is provided, retrieves that problem; otherwise returns the first problem.
        """
        filters = get_filters(request.query_params)

        qs = self.get_queryset()

        if filters is not None:
            qs = qs.filter(filters)

        problem = None
        if pk is not None:
            try:
                problem = qs.get(id=pk)
            except Problem.DoesNotExist:
                # The selected problem may not be part of the selected filters.
                # In that case, we simply take the first problem from the queryset.
                pass

        if problem is None:
            problem = qs.first()

        problem_index = problem.get_index(qs) if problem else None
        related_problem_ids = get_related_problem_ids(qs, pk)

        serializer = self.get_serializer(problem)

        return Response(
            {
                "problem": serializer.data,
                "index": problem_index,
                "first": related_problem_ids.first,
                "previous": related_problem_ids.previous,
                "next": related_problem_ids.next,
                "last": related_problem_ids.last,
                "total": related_problem_ids.total,
            },
            status=HTTP_200_OK,
        )

    def create(self, request: Request) -> Response:
        """
        Creates a new Problem from the provided input data.
        """
        return self._handle_update_create_problem(request, problem_id=None)

    def partial_update(self, request: Request, pk: int) -> Response:
        """
        Updates an existing user-created Problem with the provided input data.
        """
        return self._handle_update_create_problem(request, pk)

    def _handle_update_create_problem(
        self, request: Request, problem_id: int | None
    ) -> Response:
        input_data = request.data

        serializer = ProblemInputSerializer(data=input_data)
        serializer.is_valid(raise_exception=True)
        validated_input: dict = serializer.validated_data  # type: ignore
        validated_input["id"] = problem_id

        if problem_id is None:
            problem = create_problem_from_input(validated_input)
            status = HTTP_201_CREATED
        else:
            problem = update_problem_from_input(validated_input)
            status = HTTP_200_OK

        return Response({"id": problem.pk}, status=status)


def create_problem_from_input(parse_input: dict) -> Problem:
    """
    Save a new Problem instance from the given parse input data.
    """

    premise_sentences = [
        Sentence.objects.get_or_create(text=premise)[0]
        for premise in parse_input["premises"]
    ]

    hypothesis_sentence = Sentence.objects.get_or_create(
        text=parse_input["hypothesis"]
    )[0]

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
        id = getattr(item, "id", None)
        entity1 = item["entity1"]
        relationship = item["relationship"]
        entity2 = item["entity2"]

        if id is None:
            kb = KnowledgeBase.objects.create(
                entity1=entity1,
                relationship=relationship,
                entity2=entity2,
                problem=problem,
            )
            kb_ids.append(kb.pk)
        else:
            kb = KnowledgeBase.objects.get(id=id, problem_id=problem.pk)
            kb.entity1 = entity1
            kb.relationship = relationship
            kb.entity2 = entity2
            kb.save()
            kb_ids.append(kb.pk)

    # Delete existing knowledge bases associated to this problem that are
    # not included in the input.
    KnowledgeBase.objects.filter(problem_id=problem.pk).exclude(id__in=kb_ids).delete()


def update_problem_from_input(parse_input: dict) -> Problem:
    problem = Problem.objects.get(id=parse_input["id"], dataset=Problem.Dataset.USER)

    problem.hypothesis = Sentence.objects.get_or_create(
        text=parse_input["hypothesis"],
    )[0]
    problem.save()

    premises: list[Sentence] = []
    for input_premise in parse_input["premises"]:
        premise = Sentence.objects.get_or_create(text=input_premise)[0]
        premises.append(premise)

    problem.premises.set(premises)

    update_or_create_kb_items(problem, parse_input["kbItems"])

    return problem
