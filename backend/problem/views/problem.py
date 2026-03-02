from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.status import (
    HTTP_201_CREATED,
    HTTP_200_OK,
    HTTP_401_UNAUTHORIZED,
    HTTP_403_FORBIDDEN,
)
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly

from django.shortcuts import get_object_or_404

from problem.problem_details import (
    get_filters,
    get_related_problem_ids,
)
from problem.models import Problem
from problem.serializers import ProblemInputSerializer, ProblemSerializer

from annotation.models import KnowledgeBaseAnnotation, LabelAnnotation
from annotation.serializers import (
    KnowledgeBaseAnnotationSerializer,
    LabelAnnotationSerializer,
)
from user.models import User


class CreateProblemPermission(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.can_create_problem


class EditProblemPermission(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and (
            request.user.can_edit_problem or request.user.can_edit_kb
        )


class ProblemView(ModelViewSet):
    queryset = Problem.objects.all()
    serializer_class = ProblemSerializer

    def get_permissions(self):
        if self.action == "create":
            return [CreateProblemPermission()]
        if self.action == "partial_update":
            return [EditProblemPermission()]
        return [IsAuthenticatedOrReadOnly()]

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
            qs = qs.filter(filters).distinct()

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

        kb_annotations = KnowledgeBaseAnnotation.objects.filter(
            problem=problem, removed_at__isnull=True
        )
        label_annotations = LabelAnnotation.objects.filter(
            problem=problem, removed_at__isnull=True
        )

        # kbAnnotations and labelAnnotations are not included in the
        # ProblemSerializer because they require additional context for
        # determining removability, so we serialize them separately here with
        # the proper context.
        return Response(
            {
                "problem": {
                    **serializer.data,
                    "kbAnnotations": KnowledgeBaseAnnotationSerializer(
                        kb_annotations, context={"user": request.user}, many=True
                    ).data,
                    "labelAnnotations": LabelAnnotationSerializer(
                        label_annotations, context={"user": request.user}, many=True
                    ).data,
                },
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
        return self._handle_update_create_problem(request, problem_id=pk)

    def _handle_update_create_problem(
        self, request: Request, problem_id: int | None
    ) -> Response:
        user: User | None = request.user

        # Only authenticated users can create or update problems.
        if not user or not user.is_authenticated:
            return Response(
                {"detail": "Authentication credentials were not provided."},
                status=HTTP_401_UNAUTHORIZED,
            )

        input_data = request.data

        serializer = ProblemInputSerializer(data=input_data)
        serializer.is_valid(raise_exception=True)
        validated_input: dict = serializer.validated_data  # type: ignore

        # Note that 200 OK is returned even if the user is only authorized to
        # update KB annotations, but not core problem fields, because the
        # request is not entirely forbidden in that case.
        status = HTTP_200_OK

        if problem_id is None:
            if not user.can_create_problem:
                return Response(
                    {"detail": "User is not authorized to create problems."},
                    status=HTTP_403_FORBIDDEN,
                )
            problem = serializer.create(validated_input)  # type: ignore
            status = HTTP_201_CREATED

        elif not (user.can_edit_problem or user.can_edit_kb):
            return Response(
                {
                    "detail": "User is not authorized to edit problems or knowledge base annotations."
                },
                status=HTTP_403_FORBIDDEN,
            )

        else:
            problem = get_object_or_404(Problem, id=problem_id)
            if user.can_edit_problem:
                problem: Problem = serializer.update(problem, validated_input)  # type: ignore

        kb_items = validated_input.get("kbItems", [])
        if user.can_edit_kb:
            serializer.handle_kb_annotations(problem=problem, kb_items=kb_items, user=user)  # type: ignore

        return Response({"id": problem.pk}, status=status)
