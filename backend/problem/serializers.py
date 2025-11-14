from rest_framework import serializers
from django.contrib.auth.models import AnonymousUser
from problem.models import Problem, KnowledgeBase
from problem.services import FracasData, SNLIData, SickData
from annotation.models import Label, Labeling
from user.models import User


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
    labels = serializers.SerializerMethodField()

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
            "labels",
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

    def get_labels(self, problem):
        """Get active labels with attachment info and removability."""
        active_labelings = problem.labelings.filter(removed_at__isnull=True)
        return ActiveLabelSerializer(
            active_labelings, many=True, context=self.context
        ).data


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

        # TODO: remove this.
        if user is None:
            print("WARNING: No current user found in request context.")

        if user and user.is_anonymous is False:
            current_user = labeling.attached_by.pk == user.pk
        else:
            current_user = False

        return {
            "userName": labeling.attached_by.username,
            "date": labeling.attached_at.isoformat(),
            "currentUser": current_user,
        }

    def get_removable(self, labeling: Labeling) -> bool:
        """Determine if the label is removable by the current user."""
        request = self.context.get("request")
        user: User | AnonymousUser | None = request.user if request else None

        if user is None or isinstance(user, AnonymousUser):
            return False

        match user.role:
            case User.Role.VISITOR:
                return False
            case User.Role.MASTER_ANNOTATOR:
                return True
            case User.Role.ANNOTATOR:
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
