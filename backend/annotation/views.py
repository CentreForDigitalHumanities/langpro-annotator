from django.db import transaction
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.generics import ListAPIView
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import (
    IsAuthenticated,
    AllowAny,
    SAFE_METHODS,
)

from annotation.models import (
    AnnotationSession,
    AnnotationEvent,
    Label,
    LabelAnnotation,
)
from annotation.serializers import (
    LabelAnnotationSerializer,
    LabelSerializer,
    SaveLabelsInputSerializer,
)
from django.contrib.auth.models import AnonymousUser
from problem.models import Problem
from user.models import User
from langpro_annotator.logger import logger


class AnnotationEventsView(ListAPIView):

    def list(self, request, *args, **kwargs):
        search = request.query_params.get("search")
        problem_id = None
        if search:
            try:
                problem_id = int(search)
            except (TypeError, ValueError):
                problem_id = None

        queryset = AnnotationEvent.objects.select_related("actor", "problem")
        if problem_id is not None:
            queryset = queryset.filter(problem_id=problem_id)

        events = [
            {
                "id": event.pk,
                "session": event.session_id,
                "problemId": event.problem_id,
                "eventKind": event.action,
                "annotationKind": event.event_type,
                "timestamp": event.occurred_at.isoformat(),
                "actor": event.actor.get_full_name() or event.actor.username,
                "annotationId": event.annotation_id,
                "beforeState": event.before_state,
                "afterState": event.after_state,
            }
            for event in queryset
        ]

        events.sort(key=lambda event: event["timestamp"], reverse=True)
        return Response(events)


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

        return user.has_perm("annotation.add_labelannotation")


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
                problem=problem
            ).select_related("label")

            current_label_ids = {
                annotation.label.pk for annotation in active_annotations
            }
            labels_to_remove = current_label_ids - selected_label_ids
            labels_to_add = selected_label_ids - current_label_ids

            for annotation in active_annotations:
                if annotation.label.pk in labels_to_remove:
                    self.remove_label_annotation(
                        label_annotation=annotation,
                        user=user,
                        session=session,
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
                annotation = serializer.save(session=session, problem=problem)
                self.create_label_annotation_event(
                    action=AnnotationEvent.Action.CREATED,
                    label_annotation=annotation,
                    user=user,
                    session=session,
                )

    def remove_label_annotation(
        self, label_annotation: LabelAnnotation, user: User, session: AnnotationSession
    ) -> None:
        """Mark a label annotation as removed."""

        if not user.can_remove_label_annotation(label_annotation):
            logger.warning(
                f"User {user.username} attempted to remove label {label_annotation.label.pk} "
            )
            raise PermissionDenied("You can only remove labels you attached yourself.")

        self.create_label_annotation_event(
            action=AnnotationEvent.Action.REMOVED,
            label_annotation=label_annotation,
            user=user,
            session=session,
        )

        label_annotation.delete()

    def create_label_annotation_event(
        self,
        action: AnnotationEvent.Action,
        label_annotation: LabelAnnotation,
        user: User,
        session: AnnotationSession,
    ) -> None:
        """Create an AnnotationEvent for a label annotation action."""
        before_state = (
            {
                "label_id": label_annotation.label.pk,
                "label": label_annotation.label.text,
                "notes": label_annotation.notes,
            }
            if action == AnnotationEvent.Action.REMOVED
            else None
        )

        after_state = (
            {
                "label_id": label_annotation.label.pk,
                "label": label_annotation.label.text,
                "notes": label_annotation.notes,
            }
            if action == AnnotationEvent.Action.CREATED
            else None
        )

        AnnotationEvent.objects.create(
            session=session,
            problem=label_annotation.problem,
            actor=user,
            action=action,
            event_type=AnnotationEvent.EventType.LABEL,
            annotation_id=label_annotation.pk,
            before_state=before_state,
            after_state=after_state,
        )
