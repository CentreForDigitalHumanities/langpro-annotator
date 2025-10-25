from rest_framework import serializers
from problem.models import Problem, KnowledgeBase


class KnowledgeBaseSerializer(serializers.ModelSerializer):
    # If an ID is not provided, it means a new KB item is to be created.
    id = serializers.IntegerField(required=False, allow_null=True)
    relationship = serializers.CharField(required=True)

    class Meta:
        model = KnowledgeBase
        fields = ["id", "entity1", "entity2", "relationship"]

    def validate_id(self, value):
        """Validate that the KnowledgeBase ID exists if provided."""
        if value is not None:
            if not KnowledgeBase.objects.filter(id=value).exists():
                raise serializers.ValidationError(
                    f"KnowledgeBase item with ID {value} does not exist."
                )
        return value


class ProblemInputSerializer(serializers.Serializer):
    """
    Serializer for validating problem input data.
    This is used for both creating and updating user-created problems.
    """

    id = serializers.IntegerField(required=False, allow_null=True)
    premises = serializers.ListField(
        child=serializers.CharField(allow_blank=False),
        allow_empty=False,
        help_text="List of premise sentence texts",
    )
    hypothesis = serializers.CharField(
        allow_blank=False, help_text="Hypothesis sentence text"
    )
    kbItems = KnowledgeBaseSerializer(
        many=True, allow_empty=True, help_text="List of knowledge base items"
    )

    base = serializers.IntegerField(required=False, allow_null=True)

    def validate_id(self, value):
        """
        Validate that the problem ID exists and belongs to a user problem.
        Users are not allowed to modify non-user problems.
        """
        if value is not None:
            if not Problem.objects.filter(
                id=value, dataset=Problem.Dataset.USER
            ).exists():
                raise serializers.ValidationError(
                    f"Problem with ID {value} does not exist or is not a user problem."
                )
        return value

    def validate_base(self, value):
        """Validate that the base problem ID exists if provided."""
        if value is not None:
            if not Problem.objects.filter(id=value).exists():
                raise serializers.ValidationError(
                    f"Base problem with ID {value} does not exist."
                )
        return value
