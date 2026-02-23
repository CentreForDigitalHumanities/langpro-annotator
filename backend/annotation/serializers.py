from rest_framework import serializers

from django.contrib.auth.models import AnonymousUser

from annotation.models import (
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

    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    createdBy = serializers.SerializerMethodField(method_name="get_createdBy", read_only=True)
    removedAt = serializers.DateTimeField(
        source="removed_at", allow_null=True, read_only=True
    )
    removedBy = serializers.PrimaryKeyRelatedField(
        source="removed_by", allow_null=True, read_only=True
    )
    removable = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = None  # To be set in subclasses
        fields = [
            "id",
            "session",
            "problem",
            "createdAt",
            "createdBy",
            "removedAt",
            "removedBy",
            "notes",
            "removable",
        ]
        abstract = True

    def get_removable(self, annotation) -> bool:
        """This should be overridden in subclasses."""
        raise NotImplementedError("Subclasses must implement get_removable method.")

    def get_createdBy(self, annotation) -> str | None:
        """
        Return the full name of the user who created the annotation or a
        default string if not available.
        """
        default = "unknown user"
        if annotation.created_by is None:
            return default

        created_by_name = f"{annotation.created_by.first_name} {annotation.created_by.last_name}".strip()
        return created_by_name if created_by_name else default


class KnowledgeBaseAnnotationSerializer(AnnotationBaseSerializer):
    """
    Serializer for the KnowledgeBaseAnnotation model.

    Requires context to be set with the current user for determining
    removability, e.g. KnowledgeBaseAnnotationSerializer(annotation, context={"user": request.user})
    """

    id = serializers.IntegerField(required=False, allow_null=True)
    # Mark relationship as required. DRF thinks it is optional because it has a
    # default value in the model.
    relationship = serializers.ChoiceField(
        choices=KnowledgeBaseAnnotation.Relationship.choices,
        required=True,
    )
    session = serializers.PrimaryKeyRelatedField(read_only=True)
    problem = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta(AnnotationBaseSerializer.Meta):
        model = KnowledgeBaseAnnotation
        fields = [
            "id",
            "entity1",
            "entity2",
            "relationship",
        ] + AnnotationBaseSerializer.Meta.fields

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

    label = LabelSerializer(read_only=True)
    label_id = serializers.PrimaryKeyRelatedField(
        queryset=Label.objects.all(),
        source="label",
        write_only=True,
        required=False,
    )
    attachedByCurrentUser = serializers.SerializerMethodField(read_only=True)
    removable = serializers.SerializerMethodField(read_only=True)

    class Meta(AnnotationBaseSerializer.Meta):
        model = LabelAnnotation
        fields = [
            "id",
            "label",
            "label_id",
            "attachedByCurrentUser",
            "removable",
        ] + AnnotationBaseSerializer.Meta.fields

    def get_attachedByCurrentUser(self, annotation: LabelAnnotation) -> bool:
        """Determine if the label was attached by the current user."""
        user: User | AnonymousUser | None = self.context.get("user", None)

        if user and user.is_anonymous is False:
            return annotation.is_attached_by_user(user)
        return False

    def get_removable(self, annotation: LabelAnnotation) -> bool:
        """Determine if the label annotation is removable by the current user."""
        user: User | AnonymousUser | None = self.context.get("user", None)

        if user is None or user.is_anonymous:
            return False

        if user.is_superuser or user.has_perm("annotation.delete_any_labelannotation"):
            return True

        if user.has_perm("annotation.delete_own_labelannotation"):
            return annotation.is_attached_by_user(user)

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
