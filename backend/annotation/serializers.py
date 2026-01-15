from django.contrib.auth.models import AnonymousUser
from rest_framework import serializers

from annotation.models import (
    AnnotationSession,
    ProblemAnnotation,
    KnowledgeBaseAnnotation,
    Label,
    Labeling,
)
from problem.models import Problem
from user.models import User


class KnowledgeBaseAnnotationSerializer(serializers.ModelSerializer):
    # Mark relationship as required. DRF thinks it is optional since it has a
    # default value in the model.
    relationship = serializers.ChoiceField(
        choices=KnowledgeBaseAnnotation.Relationship.choices,
        required=True,
    )

    class Meta:
        model = KnowledgeBaseAnnotation
        fields = [
            "id",
            "entity1",
            "entity2",
            "relationship",
        ]

    def validate_id(self, value):
        """Validate that the KnowledgeBaseAnnotation ID exists if provided."""
        if value is not None:
            if not KnowledgeBaseAnnotation.objects.filter(id=value).exists():
                raise serializers.ValidationError(
                    f"KnowledgeBaseAnnotation item with ID {value} does not exist."
                )
        return value

    def update(
        self, instance: KnowledgeBaseAnnotation, validated_data: dict
    ) -> KnowledgeBaseAnnotation:
        """Update an existing KnowledgeBaseAnnotation item."""
        instance.entity1 = validated_data["entity1"]
        instance.relationship = validated_data["relationship"]
        instance.entity2 = validated_data["entity2"]
        instance.save()
        return instance


class ProblemAnnotationSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProblemAnnotation
        fields = [
            "id",
            "created_at",
            "entailment_label",
        ]


class AnnotationSerializer(serializers.Serializer):
    kbAnnotations = serializers.SerializerMethodField()
    problemAnnotations = serializers.SerializerMethodField()

    class Meta:
        fields = [
            "kbAnnotations",
            "problemAnnotations",
        ]

    def get_kbAnnotations(self, obj):
        problem, last_session = self._get_problem_and_last_session()
        if not problem or not last_session:
            return []
        kb_annotations = KnowledgeBaseAnnotation.objects.filter(
            session=last_session, problem=problem
        )
        return KnowledgeBaseAnnotationSerializer(kb_annotations, many=True).data

    def get_problemAnnotations(self, obj):
        problem, last_session = self._get_problem_and_last_session()
        problem_annotations = ProblemAnnotation.objects.filter(
            session=last_session, problem=problem
        )
        return ProblemAnnotationSerializer(problem_annotations, many=True).data

    def _get_problem_and_last_session(self):
        problem = self.context.get("problem", None)
        user = self.context.get("user", None)
        if not problem or not user or user.is_authenticated is False:
            return None, None
        last_session = (
            AnnotationSession.objects.filter(user=user).order_by("-created_at").first()
        )
        return problem, last_session


class LabelSerializer(serializers.ModelSerializer):
    """
    Serializer for Label model.
    """

    class Meta:
        model = Label
        fields = ["id", "text", "description"]


class ActiveLabelSerializer(serializers.Serializer):
    """
    Serializer for active labels attached to a problem.
    Includes attachedInfo and removable status based on current user.
    """

    id = serializers.IntegerField(source="label.id")
    text = serializers.CharField(source="label.text")
    description = serializers.CharField(source="label.description")
    attachedInfo = serializers.SerializerMethodField()
    removable = serializers.SerializerMethodField()

    def get_attachedInfo(self, labeling: Labeling) -> dict:
        """Get attachment information for the label."""
        request = self.context.get("request")
        user: User | AnonymousUser | None = request.user if request else None

        if user and user.is_anonymous is False:
            attached_by_current_user = labeling.attached_by.pk == user.pk
        else:
            attached_by_current_user = False

        return {
            "userName": labeling.attached_by.username,
            "date": labeling.attached_at.isoformat(),
            "attachedByCurrentUser": attached_by_current_user,
        }

    def get_removable(self, labeling: Labeling) -> bool:
        """Determine if the label is removable by the current user."""
        request = self.context.get("request")
        user: User | AnonymousUser | None = request.user if request else None

        if user is None or user.is_anonymous:
            return False

        if user.is_superuser or user.has_perm("annotation.delete_any_labeling"):
            return True

        if user.has_perm("annotation.delete_own_labeling"):
            return labeling.attached_by.pk == user.pk

        return False


class LabelingSerializer(serializers.ModelSerializer):
    """
    Serializer for Labeling model, including the full label details.
    """

    label = LabelSerializer(read_only=True)
    attachedAt = serializers.DateTimeField(source="attached_at")
    attachedBy = serializers.PrimaryKeyRelatedField(
        source="attached_by", read_only=True
    )
    removedAt = serializers.DateTimeField(source="removed_at", allow_null=True)
    removedBy = serializers.PrimaryKeyRelatedField(
        source="removed_by", allow_null=True, read_only=True
    )

    class Meta:
        model = Labeling
        fields = [
            "id",
            "label",
            "attached_at",
            "attached_by",
            "removed_at",
            "removed_by",
            "notes",
        ]


class SelectedLabelSerializer(serializers.Serializer):
    """Serializer for a selected label in the save labels input."""

    id = serializers.IntegerField()

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
    remarks = serializers.CharField(required=False, allow_blank=True, default="")

    def validate_problemId(self, value):
        """Validate that the problem exists."""
        if not Problem.objects.filter(id=value).exists():
            raise serializers.ValidationError(
                f"Problem with ID {value} does not exist."
            )
        return value
