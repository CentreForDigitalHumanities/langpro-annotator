from rest_framework import serializers
from django.contrib.auth.models import AnonymousUser

from user.models import User
from annotation.models import Label, Labeling
from problem.services import FracasData, SNLIData, SickData
from problem.models import Problem, KnowledgeBase, Sentence


class KnowledgeBaseSerializer(serializers.ModelSerializer):

    class Meta:
        model = KnowledgeBase
        fields = ["id", "entity1", "entity2", "relationship"]
        extra_kwargs = {
            # Without this, the relationship field is not required during validation.
            "relationship": {"required": True},
        }

    def validate_id(self, value):
        """Validate that the KnowledgeBase ID exists if provided."""
        if value is not None:
            if not KnowledgeBase.objects.filter(id=value).exists():
                raise serializers.ValidationError(
                    f"KnowledgeBase item with ID {value} does not exist."
                )
        return value

    def create_for_problem(
        self, validated_data: dict, problem: Problem
    ) -> KnowledgeBase:
        """Create a new KnowledgeBase item for a problem."""
        return KnowledgeBase.objects.create(
            **validated_data,
            problem=problem,
        )

    def update(self, instance: KnowledgeBase, validated_data: dict) -> KnowledgeBase:
        """Update an existing KnowledgeBase item."""
        instance.entity1 = validated_data["entity1"]
        instance.relationship = validated_data["relationship"]
        instance.entity2 = validated_data["entity2"]
        instance.save()
        return instance


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
            "base",
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

    def create(self, validated_data: dict) -> Problem:
        """
        Create a new Problem instance from validated input data.
        Handles creation of related Sentence and KnowledgeBase objects.
        """
        premise_sentences = [
            Sentence.objects.get_or_create(text=premise)[0]
            for premise in validated_data["premises"]
        ]

        hypothesis_sentence = Sentence.objects.get_or_create(
            text=validated_data["hypothesis"]
        )[0]

        problem = Problem.objects.create(
            base_id=validated_data.get("base", None),
            hypothesis=hypothesis_sentence,
            dataset=Problem.Dataset.USER,
            # TODO: Determine entailment label based on LangPro parser output.
            entailment_label=Problem.EntailmentLabel.UNKNOWN,
            extra_data={},
        )

        problem.premises.set(premise_sentences)

        kb_items = validated_data.get("kbItems", [])
        if kb_items:
            self._update_or_create_kb_items(problem, kb_items)

        return problem

    def update(self, instance: Problem, validated_data: dict) -> Problem:
        """
        Update an existing Problem instance from validated input data.
        Handles updating of related Sentence and KnowledgeBase objects.
        """
        if instance.dataset != Problem.Dataset.USER:
            raise serializers.ValidationError(
                "Cannot update a problem that is not a user-created problem."
            )

        instance.hypothesis = Sentence.objects.get_or_create(
            text=validated_data["hypothesis"],
        )[0]

        validated_base_id = validated_data.get("base", None)
        if validated_base_id is None:
            instance.base = None
        else:
            try:
                base_problem = Problem.objects.get(id=validated_base_id)
            except Problem.DoesNotExist:
                raise serializers.ValidationError(
                    f"Base problem with ID {validated_base_id} does not exist."
                )
            instance.base = base_problem  # type: ignore

        instance.save()

        premise_sentences = [
            Sentence.objects.get_or_create(text=premise)[0]
            for premise in validated_data["premises"]
        ]
        instance.premises.set(premise_sentences)

        self._update_or_create_kb_items(instance, validated_data.get("kbItems", []))

        return instance

    def _update_or_create_kb_items(
        self, problem: Problem, kb_items: list[dict]
    ) -> None:
        """Create or update KnowledgeBase items for a problem."""
        kb_ids: list[int] = []
        kb_serializer = KnowledgeBaseSerializer()

        for item in kb_items:
            kb_id = item.get("id", None)

            if kb_id is None:
                kb = kb_serializer.create_for_problem(item, problem=problem)  # type: ignore
            else:
                kb_instance = KnowledgeBase.objects.get(id=kb_id, problem_id=problem.pk)
                kb = kb_serializer.update(kb_instance, item)

            kb_ids.append(kb.pk)

        # Delete existing knowledge bases associated to this problem that are
        # not included in the input.
        KnowledgeBase.objects.filter(problem_id=problem.pk).exclude(
            id__in=kb_ids
        ).delete()


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

    base = serializers.IntegerField(required=False, allow_null=True)

    def validate_id(self, value):
        """Validate that the Problem ID, if provided, exists and belongs to a user-created problem."""
        if value is not None:
            if not Problem.objects.filter(
                id=value, dataset=Problem.Dataset.USER
            ).exists():
                raise serializers.ValidationError(
                    f"Problem with ID {value} does not exist."
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
