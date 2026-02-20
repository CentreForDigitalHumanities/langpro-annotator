from rest_framework import serializers

from annotation.serializers import KnowledgeBaseAnnotationSerializer
from annotation.models import (
    AnnotationSession,
    KnowledgeBaseAnnotation,
)
from problem.services import FracasData, SNLIData, SickData
from problem.models import Problem, Sentence


class ProblemSerializer(serializers.ModelSerializer):
    """
    Serializer for Problem model output.
    """

    id = serializers.IntegerField(read_only=True)
    premises = serializers.SerializerMethodField()
    hypothesis = serializers.SerializerMethodField()
    entailmentLabel = serializers.CharField(source="entailment_label")
    extraData = serializers.SerializerMethodField()

    class Meta:
        model = Problem
        fields = [
            "id",
            "dataset",
            "premises",
            "hypothesis",
            "entailmentLabel",
            "extraData",
            "base",
        ]

    def get_premises(self, problem: Problem):
        """Get list of premise texts."""
        return [premise.text for premise in problem.premises.all()]

    def get_hypothesis(self, problem: Problem):
        """Get hypothesis text."""
        return problem.hypothesis.text

    def get_extraData(self, problem: Problem):
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
    kbItems = KnowledgeBaseAnnotationSerializer(
        many=True,
        help_text="List of knowledge base annotations",
        required=False,
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
            self._create_update_kb_annotations(problem, kb_items)

        return problem

    def _create_update_kb_annotation(
        self, kb_item: dict, problem: Problem, session: AnnotationSession
    ) -> None:
        kb_id = kb_item.get("id", None)

        update_data = {
            **kb_item,
            "problem_id": problem.pk,
            "session_id": session.pk,
        }

        if kb_id is None:
            # Create new KnowledgeBaseAnnotation
            serializer = KnowledgeBaseAnnotationSerializer(data=update_data)
        else:
            # Update existing KnowledgeBaseAnnotation
            try:
                kb_instance = KnowledgeBaseAnnotation.objects.get(
                    id=kb_id, problem_id=problem.pk
                )
                serializer = KnowledgeBaseAnnotationSerializer(
                    kb_instance, data=update_data
                )
            except KnowledgeBaseAnnotation.DoesNotExist:
                raise serializers.ValidationError(
                    f"KnowledgeBaseAnnotation with ID {kb_id} does not exist "
                    f"for this problem and session."
                )

        serializer.is_valid(raise_exception=True)
        serializer.save(problem=problem, session=session, created_by=session.user)

    def _create_update_kb_annotations(
        self, problem: Problem, kb_items: list[dict]
    ) -> None:
        """
        Creates or update KnowledgeBase and Label annotations for a problem.
        Creates an annotation session if it does not exist.

        TODO: handle deletions!
        """
        request = self.context.get("request", None)
        if not request or not request.user.is_authenticated:
            return

        session = AnnotationSession.objects.create(user=request.user)

        for kb_item in kb_items:
            self._create_update_kb_annotation(kb_item, problem, session)

    def update(self, instance: Problem, validated_data: dict) -> Problem:
        """
        Update an existing Problem instance from validated input data.
        Handles updating of related Sentence and KnowledgeBase objects.
        """

        # KB annotations can be made for all problems.
        kb_items = validated_data.get("kbItems", [])
        if kb_items:
            self._create_update_kb_annotations(instance, kb_items)

        # Other fields can only be updated for user-created problems.
        if instance.dataset != Problem.Dataset.USER:
            return instance

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

        return instance
