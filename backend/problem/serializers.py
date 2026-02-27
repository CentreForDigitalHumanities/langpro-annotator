from rest_framework import serializers
from django.utils import timezone

from annotation.serializers import KnowledgeBaseAnnotationSerializer
from annotation.models import (
    AnnotationSession,
    KnowledgeBaseAnnotation,
)
from problem.services import FracasData, SNLIData, SickData
from problem.models import Problem, Sentence
from user.models import User


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
        """Validate that the Problem ID, if provided, exists."""
        if value is not None:
            if not Problem.objects.filter(id=value).exists():
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
        """
        new_user_problem = Problem(dataset=Problem.Dataset.USER)

        return self._update_core_problem_fields(new_user_problem, validated_data)

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

    def _mark_kb_not_in_input_as_removed(
        self, problem: Problem, kb_items: list[dict], session: AnnotationSession
    ) -> None:
        """
        Marks KnowledgeBase annotations for a problem that are not included in
        the provided list of kb_items as removed.
        """
        kb_item_ids = {
            kb_item.get("id") for kb_item in kb_items if kb_item.get("id") is not None
        }

        annotations_to_delete = KnowledgeBaseAnnotation.objects.filter(
            problem=problem, removed_at__isnull=True
        ).exclude(id__in=kb_item_ids)

        current_time = timezone.now()

        for annotation in annotations_to_delete:
            annotation.removed_at = current_time
            annotation.removed_by = session.user
            annotation.save()

    def handle_kb_annotations(
        self, problem: Problem, kb_items: list[dict], user: User
    ) -> None:
        """
        Creates, updates and deletes KnowledgeBase annotations for a problem.
        Creates an annotation session if it does not exist.
        """
        session = AnnotationSession.objects.create(user=user)

        self._mark_kb_not_in_input_as_removed(problem, kb_items, session)

        for kb_item in kb_items:
            self._create_update_kb_annotation(kb_item, problem, session)

    def update(self, instance: Problem, validated_data: dict) -> Problem:
        """
        Updates Problem core fields from validated input data.
        """
        # Only USER-problems can be updated.
        if instance.dataset != Problem.Dataset.USER:
            return instance

        return self._update_core_problem_fields(instance, validated_data)
    
    def _update_core_problem_fields(self, instance: Problem, validated_data: dict) -> Problem:
        """
        Updates core Problem fields (premises, hypothesis, base) from validated
        input data.
        """
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
