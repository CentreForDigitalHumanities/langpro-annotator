from rest_framework import serializers
from problem.services import FracasData, SNLIData, SickData
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


class ProblemSerializer(serializers.ModelSerializer):
    """
    Serializer for Problem model output.
    Handles serialization of problems with all related data including labels.
    """

    premises = serializers.SerializerMethodField()
    hypothesis = serializers.SerializerMethodField()
    entailmentLabel = serializers.CharField(source="entailment_label")
    extraData = serializers.SerializerMethodField()
    kbItems = serializers.SerializerMethodField()

    class Meta:
        model = Problem
        fields = [
            "id",
            "dataset",
            "premises",
            "hypothesis",
            "entailmentLabel",
            "extraData",
            "kbItems",
        ]

    def get_premises(self, problem):
        """Get list of premise texts."""
        return [premise.text for premise in problem.premises.all()]

    def get_hypothesis(self, problem):
        """Get hypothesis text."""
        return problem.hypothesis.text

    def get_extraData(self, problem):
        """Get dataset-specific extra data."""
        match problem.dataset:
            case Problem.Dataset.SICK:
                return SickData.serialize(problem.extra_data)
            case Problem.Dataset.FRACAS:
                return FracasData.serialize(problem.extra_data)
            case Problem.Dataset.SNLI:
                return SNLIData.serialize(problem.extra_data)
            case _:
                return {}

    def get_kbItems(self, problem):
        """Get knowledge base items."""
        kb_items = problem.knowledge_bases.all()
        return KnowledgeBaseSerializer(kb_items, many=True).data


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
