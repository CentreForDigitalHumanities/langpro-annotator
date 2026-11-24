from rest_framework import serializers

from django.contrib.auth.models import AnonymousUser

from annotation.models import (
    AnnotationEvent,
    KnowledgeBaseAnnotation,
    Label,
    LabelAnnotation,
)
from problem.models import Problem
from user.models import User


class AnnotationBaseSerializer(serializers.ModelSerializer):
    """
    Base serializer for AnnotationBase model.
    """

    removable = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = None  # To be set in subclasses
        fields = [
            "id",
            "problem",
            "notes",
            "removable",
        ]
        abstract = True

    def get_removable(self, annotation) -> bool:
        """This should be overridden in subclasses."""
        raise NotImplementedError("Subclasses must implement get_removable method.")


class KnowledgeBaseAnnotationSerializer(AnnotationBaseSerializer):
    """
    Serializer for the KnowledgeBaseAnnotation model.

    Requires context to be set with the current user for determining
    removability, e.g. KnowledgeBaseAnnotationSerializer(annotation, context={"user": request.user})
    """

    annotationKind = serializers.SerializerMethodField(read_only=True)

    id = serializers.IntegerField(required=False, allow_null=True)
    # Mark relationship as required. DRF thinks it is optional because it has a
    # default value in the model.
    relationship = serializers.ChoiceField(
        choices=KnowledgeBaseAnnotation.Relationship.choices,
        required=True,
    )
    problem = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta(AnnotationBaseSerializer.Meta):
        model = KnowledgeBaseAnnotation
        fields = [
            "id",
            "annotationKind",
            "entity1",
            "entity2",
            "relationship",
        ] + AnnotationBaseSerializer.Meta.fields

    def get_annotationKind(self, annotation: KnowledgeBaseAnnotation) -> str:
        return "knowledgeBase"

    def get_removable(self, annotation: KnowledgeBaseAnnotation) -> bool:
        """Determine if the KB annotation is removable by the current user."""
        user: User | AnonymousUser | None = self.context.get("user", None)

        if user is None or user.is_anonymous:
            return False

        return user.has_perm("annotation.change_knowledgebaseannotation")

    def validate_id(self, value):
        """Validate that the KnowledgeBaseAnnotation ID exists if provided."""
        if value is None or KnowledgeBaseAnnotation.objects.filter(id=value).exists():
            return value
        raise serializers.ValidationError(
            f"KnowledgeBaseAnnotation item with ID {value} does not exist."
        )


class LabelSerializer(serializers.ModelSerializer):
    """
    Serializer for Label model.
    """

    class Meta:
        model = Label
        fields = ["id", "text", "description"]


class LabelAnnotationSerializer(AnnotationBaseSerializer):
    """
    Serializer for LabelAnnotation model.

    Requires context to be set with the current user for determining
    removability, e.g. LabelAnnotationSerializer(annotation, context={"user": request.user})
    """

    annotationKind = serializers.SerializerMethodField(read_only=True)

    label = LabelSerializer(read_only=True)
    label_id = serializers.PrimaryKeyRelatedField(
        queryset=Label.objects.all(),
        source="label",
        write_only=True,
        required=False,
    )
    attachedBy = serializers.SerializerMethodField(read_only=True)
    attachedByCurrentUser = serializers.SerializerMethodField(read_only=True)
    removable = serializers.SerializerMethodField(read_only=True)

    class Meta(AnnotationBaseSerializer.Meta):
        model = LabelAnnotation
        fields = [
            "id",
            "annotationKind",
            "label",
            "label_id",
            "attachedBy",
            "attachedByCurrentUser",
            "removable",
        ] + AnnotationBaseSerializer.Meta.fields

    def get_annotationKind(self, annotation: LabelAnnotation) -> str:
        return "label"

    def get_attachedBy(self, annotation: LabelAnnotation) -> str:
        """Get the name of the user who attached the label."""
        created_event = (
            AnnotationEvent.objects.filter(
                event_type=AnnotationEvent.EventType.LABEL,
                action=AnnotationEvent.Action.CREATED,
                annotation_id=annotation.pk,
            )
            .order_by("-occurred_at")
            .first()
        )
        if created_event and created_event.actor:
            return created_event.actor.get_full_name() or created_event.actor.username
        return "Unknown"

    def get_attachedByCurrentUser(self, annotation: LabelAnnotation) -> bool:
        """Determine if the label was attached by the current user."""
        user: User | AnonymousUser | None = self.context.get("user", None)

        if user and user.is_anonymous is False:
            return annotation.is_created_by_user(user)
        return False

    def get_removable(self, annotation: LabelAnnotation) -> bool:
        """Determine if the label annotation is removable by the current user."""
        user: User | AnonymousUser | None = self.context.get("user", None)

        if user is None or user.is_anonymous:
            return False

        if user.is_superuser or user.has_perm("annotation.delete_any_labelannotation"):
            return True

        if user.has_perm("annotation.delete_own_labelannotation"):
            return annotation.is_created_by_user(user)

        return False


class SelectedLabelSerializer(serializers.Serializer):
    """Serializer for a selected label in the save labels input."""

    id = serializers.IntegerField(required=False)

    def validate_id(self, value):
        """Validate that the label exists."""
        if not Label.objects.filter(id=value).exists():
            raise serializers.ValidationError(f"Label with ID {value} does not exist.")
        return value


class SaveLabelsInputSerializer(serializers.Serializer):
    """
    Serializer for validating save labels input data.
    Used when saving/updating labels for a problem.
    """

    problemId = serializers.IntegerField()
    selectedLabels = SelectedLabelSerializer(many=True, allow_empty=True)

    def validate_problemId(self, value):
        """Validate that the problem exists."""
        if not Problem.objects.filter(id=value).exists():
            raise serializers.ValidationError(
                f"Problem with ID {value} does not exist."
            )
        return value


class AnnotationEventSerializer(serializers.Serializer):
    """
    Serializer for AnnotationEvent model.
    """

    id = serializers.IntegerField()
    session = serializers.IntegerField(source="session.pk")
    problemId = serializers.IntegerField(source="problem.pk")
    eventKind = serializers.CharField(source="action")
    annotationKind = serializers.CharField(source="event_type")
    timestamp = serializers.DateTimeField(source="occurred_at")
    actor = serializers.CharField(source="actor.get_full_name", default="Unknown")
    beforeState = serializers.JSONField(allow_null=True, source="before_state")
    afterState = serializers.JSONField(allow_null=True, source="after_state")

    class Meta:
        model = AnnotationEvent
        fields = [
            "id",
            "session",
            "problemId",
            "eventKind",
            "annotationKind",
            "timestamp",
            "actor",
            "beforeState",
            "afterState",
        ]
