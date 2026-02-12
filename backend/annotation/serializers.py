from rest_framework import serializers

from django.contrib.auth.models import AnonymousUser

from annotation.models import (
    AnnotationSession,
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
    createdBy = serializers.PrimaryKeyRelatedField(source="created_by", read_only=True)
    removedAt = serializers.DateTimeField(
        source="removed_at", allow_null=True, read_only=True
    )
    removedBy = serializers.PrimaryKeyRelatedField(
        source="removed_by", allow_null=True, read_only=True
    )
    removable = serializers.SerializerMethodField()

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


class KnowledgeBaseAnnotationSerializer(AnnotationBaseSerializer):
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
        request = self.context.get("request")
        user: User | AnonymousUser | None = request.user if request else None

        if user is None or user.is_anonymous:
            return False

        return user.has_perm("annotation.delete_knowledgebaseannotation")

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
    """

    label = LabelSerializer(read_only=True)
    label_id = serializers.PrimaryKeyRelatedField(
        queryset=Label.objects.all(),
        source="label",
        write_only=True,
        required=False,
    )
    attachedByCurrentUser = serializers.SerializerMethodField()
    removable = serializers.SerializerMethodField()

    class Meta(AnnotationBaseSerializer.Meta):
        model = LabelAnnotation
        fields = [
            "id",
            "label",
            "label_id",
            "attachedByCurrentUser",
        ] + AnnotationBaseSerializer.Meta.fields

    def get_attachedByCurrentUser(self, annotation: LabelAnnotation) -> bool:
        """Determine if the label was attached by the current user."""
        user: User | AnonymousUser | None = self.context.get("user", None)

        if user and user.is_anonymous is False:
            return annotation.created_by.pk == user.pk
        return False

    def get_removable(self, annotation: LabelAnnotation) -> bool:
        """Determine if the label annotation is removable by the current user."""
        user: User | AnonymousUser | None = self.context.get("user", None)

        if user is None or user.is_anonymous:
            return False

        if user.is_superuser or user.has_perm("annotation.delete_any_labelannotation"):
            return True

        if user.has_perm("annotation.delete_own_labelannotation"):
            return annotation.created_by.pk == user.pk

        return False


class AnnotationSerializer(serializers.Serializer):
    kbAnnotations = serializers.SerializerMethodField()
    labelAnnotations = serializers.SerializerMethodField()

    class Meta:
        fields = ["kbAnnotations", "labelAnnotations"]

    def get_kbAnnotations(self, obj):
        problem, last_session = self._get_problem_and_last_session()
        if not problem or not last_session:
            return []
        kb_annotations = KnowledgeBaseAnnotation.objects.filter(
            problem=problem, session=last_session, removed_at__isnull=True
        )
        return KnowledgeBaseAnnotationSerializer(kb_annotations, many=True).data

    def get_labelAnnotations(self, obj):
        problem, last_session = self._get_problem_and_last_session()
        if not problem or not last_session:
            return []
        label_annotations = LabelAnnotation.objects.filter(
            problem=problem, session=last_session, removed_at__isnull=True
        )
        return LabelAnnotationSerializer(
            label_annotations, many=True, context=self.context
        ).data

    def _get_problem_and_last_session(self):
        problem = self.context.get("problem", None)
        user = self.context.get("user", None)
        if not problem or not user or user.is_authenticated is False:
            return None, None
        last_session = (
            AnnotationSession.objects.filter(user=user).order_by("-created_at").first()
        )
        return problem, last_session


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
