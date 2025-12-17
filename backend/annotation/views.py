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
    """Permission class for saving labelings."""

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False

        if request.user.is_superuser:
            return True

        return request.user.has_perm("annotation.add_labeling")


class LabelView(ModelViewSet):
    """
    ViewSet for Label model.

    GET: All users can list and retrieve labels.
    POST: Only selected users can save labelings (attach/remove labels from problems).
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

        try:
            self._update_labelings(problem, user, selected_label_ids, remarks)
        except PermissionError as e:
            return Response({"detail": str(e)}, status=403)

        return Response({"ok": True}, status=HTTP_200_OK)

    def _update_labelings(
        self,
        problem: Problem,
        user: User,
        selected_label_ids: set[int],
        remarks: str,
    ) -> None:
        """Update labelings for a problem based on selected labels."""

        with transaction.atomic():
            active_labelings = Labeling.objects.filter(
                problem=problem, removed_at__isnull=True
            ).select_related("label", "attached_by")

            current_label_ids = {labeling.label.pk for labeling in active_labelings}
            labels_to_remove = current_label_ids - selected_label_ids
            labels_to_add = selected_label_ids - current_label_ids

            for labeling in active_labelings:
                if labeling.label.pk in labels_to_remove:
                    self._remove_labeling(
                        labeling=labeling,
                        user=user,
                        remarks=remarks,
                    )

            for label_id in labels_to_add:
                self._create_labeling(
                    label_id=label_id,
                    problem=problem,
                    user=user,
                    remarks=remarks,
                )

    def _create_labeling(
        self, label_id: int, problem: Problem, user: User, remarks: str
    ) -> None:
        """Create a new labeling."""

        Labeling.objects.create(
            problem=problem,
            label_id=label_id,
            attached_by=user,
            notes=remarks,
        )

    def _remove_labeling(self, labeling: Labeling, user: User, remarks: str) -> None:
        """Mark a labeling as removed."""

        if not user.can_remove_labeling(labeling):
            logger.warning(
                f"User {user.username} attempted to remove label {labeling.label.pk} "
                f"attached by {labeling.attached_by.username}"
            )
            raise PermissionError("You can only remove labels you attached yourself.")
        labeling.removed_at = timezone.now()
        labeling.removed_by = user
        if remarks:
            labeling.notes = remarks
        labeling.save()
