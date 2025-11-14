from dataclasses import asdict, dataclass
from django.contrib.auth.models import AnonymousUser
from django.core.exceptions import PermissionDenied
from django.db import DatabaseError, transaction
from django.http import JsonResponse
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response

from annotation.models import Label, Labeling
from problem.models import Problem
from problem.serializers import LabelSerializer
from user.models import User
from langpro_annotator.logger import logger


@dataclass
class SaveLabelsResponse:
    ok: bool = False
    error: str | None = None

    def json_response(self, status=200) -> JsonResponse:
        return JsonResponse(asdict(self), status=status)


class LabelsView(APIView):
    """API view to list all available labels and save labels for a problem."""

    def get(self, request) -> Response:
        """Return all available labels in the system."""
        labels = Label.objects.all().order_by("text")
        serializer = LabelSerializer(labels, many=True)
        return Response(serializer.data)

    def post(self, request) -> JsonResponse:
        """
        Save labels for a problem.
        """
        user: User | AnonymousUser | None = request.user

        # Validate user authentication
        if user is None or user.is_anonymous:
            logger.error("Unauthenticated user attempted to save labels")
            return SaveLabelsResponse(
                ok=False, error="User must be authenticated to save labels."
            ).json_response(status=401)

        authenticated_user: User = user  # type: ignore

        # Check user permissions
        if authenticated_user.role == User.Role.VISITOR:
            logger.error(
                f"User {authenticated_user.username} with VISITOR role attempted to save labels"
            )
            return SaveLabelsResponse(
                ok=False, error="You do not have permission to save labels."
            ).json_response(status=403)

        try:
            data = request.data
            problem_id = data.get("problemId")
            selected_labels = data.get("selectedLabels", [])
            remarks = data.get("remarks", "")

            # Validate problem_id
            if problem_id is None:
                return SaveLabelsResponse(
                    ok=False, error="Problem ID is required."
                ).json_response(status=400)

            # Get the problem
            try:
                problem = Problem.objects.get(id=problem_id)
            except Problem.DoesNotExist:
                logger.error(f"Problem with ID {problem_id} not found")
                return SaveLabelsResponse(
                    ok=False, error=f"Problem with ID {problem_id} not found."
                ).json_response(status=404)

            # Extract label IDs from selected labels
            selected_label_ids = {label["id"] for label in selected_labels}

            # Validate that all selected labels exist
            existing_labels = Label.objects.filter(id__in=selected_label_ids)
            if existing_labels.count() != len(selected_label_ids):
                return SaveLabelsResponse(
                    ok=False, error="One or more selected labels do not exist."
                ).json_response(status=400)

            # Use transaction to ensure atomicity
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
                if labels_to_remove:
                    for labeling in active_labelings:
                        if labeling.label.pk in labels_to_remove:
                            # Only mark as removed if user has permission
                            if (
                                authenticated_user.role == User.Role.MASTER_ANNOTATOR
                                or labeling.attached_by.pk == authenticated_user.pk
                            ):
                                labeling.removed_at = timezone.now()
                                labeling.removed_by = authenticated_user
                                if remarks:
                                    labeling.notes = remarks
                                labeling.save()
                            else:
                                logger.warning(
                                    f"User {authenticated_user.username} attempted to remove label {labeling.label.pk} "
                                    f"attached by {labeling.attached_by.username}"
                                )
                                return SaveLabelsResponse(
                                    ok=False,
                                    error=f"You can only remove labels you attached yourself.",
                                ).json_response(status=403)

                # Add new labels
                for label_id in labels_to_add:
                    Labeling.objects.create(
                        problem=problem,
                        label_id=label_id,
                        attached_by=authenticated_user,
                        notes=remarks,
                    )

            logger.info(
                f"User {authenticated_user.username} saved labels for problem {problem_id}: "
                f"added {len(labels_to_add)}, removed {len(labels_to_remove)}"
            )

            return SaveLabelsResponse(ok=True).json_response(status=200)

        except DatabaseError as e:
            logger.exception(f"Database error saving labels: {e}")
            return SaveLabelsResponse(
                ok=False, error="Database error while saving labels."
            ).json_response(status=500)
        except Exception as e:
            logger.exception(f"Unexpected error saving labels: {e}")
            return SaveLabelsResponse(
                ok=False, error="An unexpected error occurred while saving labels."
            ).json_response(status=500)
