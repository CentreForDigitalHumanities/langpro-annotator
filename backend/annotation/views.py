from django.db import transaction
from django.utils import timezone
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import (
    IsAuthenticated,
    AllowAny,
    SAFE_METHODS,
)

from annotation.models import AnnotationSession, Label, LabelAnnotation
from annotation.serializers import (
    LabelAnnotationSerializer,
    LabelSerializer,
    SaveLabelsInputSerializer,
)
from django.contrib.auth.models import AnonymousUser
from problem.models import Problem
from user.models import User
from langpro_annotator.logger import logger


class SaveLabelAnnotationPermission(IsAuthenticated):
    """Permission class for saving label annotations."""

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False

        user: User | AnonymousUser | None = request.user

        if user is None or user.is_anonymous:
            return False

        if user.is_superuser:
            return True

        return user.has_perm("annotation.add_labelannotation") or user.has_perm(
            "annotation.change_labelannotation"
        )


class LabelAnnotationView(ModelViewSet):
    """
    ViewSet for the Label and LabelAnnotation models.

    GET: All users can list and retrieve labels.
    POST: Only selected users can save label annotations (attach/remove labels to/from problems).
    """

    queryset = Label.objects.all().order_by("text")
    serializer_class = LabelSerializer
    http_method_names = ["get", "post", "head", "options"]

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [AllowAny()]
        return [SaveLabelAnnotationPermission()]

    def create(self, request: Request) -> Response:
        """
        Create annotations by attaching/removing labels to/from a problem.

        Expects a payload with:
        - problemId: ID of the problem
        - selectedLabels: List of labels to be attached (with at least 'id' field)
        """
        serializer = SaveLabelsInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data: dict = serializer.validated_data  # type: ignore

        problem_id = validated_data["problemId"]
        selected_labels = validated_data["selectedLabels"]

        problem = Problem.objects.get(id=problem_id)
        user: User = request.user  # type: ignore

        selected_label_ids = {label["id"] for label in selected_labels}

        self._update_label_annotations(problem, user, selected_label_ids)

        return Response({"ok": True})

    def _update_label_annotations(
        self,
        problem: Problem,
        user: User,
        selected_label_ids: set[int],
    ) -> None:
        """Update label annotations for a problem based on selected labels."""

        with transaction.atomic():
            session = AnnotationSession.objects.create(user=user)

            active_annotations = LabelAnnotation.objects.filter(
                problem=problem, removed_at__isnull=True
            ).select_related("label", "created_by")

            current_label_ids = {
                annotation.label.pk for annotation in active_annotations
            }
            labels_to_remove = current_label_ids - selected_label_ids
            labels_to_add = selected_label_ids - current_label_ids

            for annotation in active_annotations:
                if annotation.label.pk in labels_to_remove:
                    self._mark_as_removed(
                        label_annotation=annotation,
                        user=user,
                    )

            for label_id in labels_to_add:
                serializer = LabelAnnotationSerializer(
                    context={"user": user},
                    data={
                        "problem": problem.pk,
                        "label_id": label_id,
                        "session": session.pk,
                    },
                )
                serializer.is_valid(raise_exception=True)
                serializer.save(created_by=user)

    def _mark_as_removed(self, label_annotation: LabelAnnotation, user: User) -> None:
        """Mark a label annotation as removed."""

        if not user.can_remove_label(label_annotation):
            logger.warning(
                f"User {user.username} attempted to remove label {label_annotation.label.pk} "
                f"attached by {label_annotation.created_by.username}"
            )
            raise PermissionDenied("You can only remove labels you attached yourself.")
        label_annotation.removed_at = timezone.now()
        label_annotation.removed_by = user
        label_annotation.save()
