from django.db import transaction
from django.utils import timezone
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.status import HTTP_200_OK
from rest_framework.permissions import (
    IsAuthenticated,
    AllowAny,
    SAFE_METHODS,
)

from annotation.models import Label, Labeling
from annotation.serializers import (
    LabelSerializer,
    SaveLabelsInputSerializer,
)
from problem.models import Problem
from user.models import User
from langpro_annotator.logger import logger


class SaveLabelingsPermission(IsAuthenticated):
    """Permission class for saving labelings. Requires Annotator or Master Annotator role."""

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False

        if request.user.is_superuser:
            return True

        return request.user.has_perm("annotation.add_labeling")


class LabelView(ModelViewSet):
    """
    ViewSet for Label model.

    GET: All users (including visitors) can list and retrieve labels.
    POST: Annotators and Master Annotators can save labelings (attach/remove labels from problems).
    """

    queryset = Label.objects.all().order_by("text")
    serializer_class = LabelSerializer
    http_method_names = ["get", "post", "head", "options"]

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [AllowAny()]
        return [SaveLabelingsPermission()]

    def create(self, request: Request) -> Response:
        """
        Save labelings for a problem (attach/remove labels).

        Expects a payload with:
        - problemId: ID of the problem
        - selectedLabels: List of labels to be attached (with at least 'id' field)
        - remarks: Optional notes
        """
        serializer = SaveLabelsInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data: dict = serializer.validated_data  # type: ignore

        problem_id = validated_data["problemId"]
        selected_labels = validated_data["selectedLabels"]
        remarks = validated_data.get("remarks", "")

        problem = Problem.objects.get(id=problem_id)
        user: User = request.user  # type: ignore

        selected_label_ids = {label["id"] for label in selected_labels}

        with transaction.atomic():
            # Get all active labelings for this problem
            active_labelings = Labeling.objects.filter(
                problem=problem, removed_at__isnull=True
            )

            # Determine which labels to remove and which to add
            current_label_ids = {labeling.label.pk for labeling in active_labelings}
            labels_to_remove = current_label_ids - selected_label_ids
            labels_to_add = selected_label_ids - current_label_ids

            # Mark labels as removed
            for labeling in active_labelings:
                if labeling.label.pk in labels_to_remove:
                    # Check permission for removal
                    if not self._can_remove_labeling(user, labeling):
                        logger.warning(
                            f"User {user.username} attempted to remove label {labeling.label.pk} "
                            f"attached by {labeling.attached_by.username}"
                        )
                        return Response(
                            {
                                "error": "You can only remove labels you attached yourself."
                            },
                            status=403,
                        )
                    labeling.removed_at = timezone.now()
                    labeling.removed_by = user
                    if remarks:
                        labeling.notes = remarks
                    labeling.save()

            # Add new labels
            for label_id in labels_to_add:
                Labeling.objects.create(
                    problem=problem,
                    label_id=label_id,
                    attached_by=user,
                    notes=remarks,
                )

        logger.info(
            f"User {user.username} saved labels for problem {problem_id}: "
            f"added {len(labels_to_add)}, removed {len(labels_to_remove)}"
        )

        return Response({"ok": True}, status=HTTP_200_OK)

    def _can_remove_labeling(self, user: User, labeling: Labeling) -> bool:
        """Check if user can remove a specific labeling."""
        if user.is_superuser or user.has_perm("annotation.delete_any_labeling"):
            return True

        if user.has_perm("annotation.delete_own_labeling"):
            return labeling.attached_by.pk == user.pk

        return False
