from rest_framework import serializers

from django.contrib.auth.models import AnonymousUser

from annotation.models import Label, Labeling
from problem.models import Problem
from user.models import User


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

        if user.is_superuser:
            return True

        if user.has_perm("annotation.delete_any_labeling"):
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
