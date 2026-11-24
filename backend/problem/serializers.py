from rest_framework import serializers
from django.db import transaction

from annotation.serializers import AnnotationEventSerializer, KnowledgeBaseAnnotationSerializer
from annotation.models import (
    AnnotationSession,
    KnowledgeBaseAnnotation,
    AnnotationEvent,
)
from problem.services import FracasData, SNLIData, SickData
from problem.models import Problem, Sentence, UsedKnowledgeBaseItem
from user.models import User


class UsedKnowledgeBaseItemSerializer(serializers.ModelSerializer):
    """
    Serializer for used knowledge base items in a problem.
    """

    class Meta:
        model = UsedKnowledgeBaseItem
        fields = ["id", "entity1", "entity2", "relationship"]


class ProblemSerializer(serializers.ModelSerializer):
    """
    Serializer for Problem model output.
    """

    id = serializers.IntegerField(read_only=True)
    premises = serializers.SerializerMethodField()
    hypothesis = serializers.SerializerMethodField()
    entailmentLabel = serializers.CharField(source="entailment_label")
    extraData = serializers.SerializerMethodField()
    status = serializers.CharField(read_only=True)
    langproPrediction = serializers.CharField(source="langpro_prediction")
    usedKbItems = UsedKnowledgeBaseItemSerializer(
        many=True, source="used_kb_items", read_only=True
    )
    annotationEvents = AnnotationEventSerializer(many=True, source="annotation_events", read_only=True)

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
            "hidden",
            "gold",
            "status",
            "langproPrediction",
            "usedKbItems",
            "annotationEvents",
        ]

    def get_hypothesis(self, problem: Problem):
        """Get hypothesis text."""
        return {
            "text": problem.hypothesis.text,
            "relatedProblems": problem.hypothesis.get_related_problems(),
        }

    def get_premises(self, problem: Problem):
        return [
            {"text": premise.text, "relatedProblems": premise.get_related_problems()}
            for premise in problem.premises.all()
        ]

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
    langproPrediction = serializers.CharField(allow_null=True)
    usedKbItems = UsedKnowledgeBaseItemSerializer(many=True, required=False)

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
        new_user_problem = Problem(dataset=Problem.Dataset.USER, extra_data={})

        return self._update_core_problem_fields(new_user_problem, validated_data)

    def _create_update_kb_annotation(
        self, kb_item: dict, problem: Problem, user: User, session: AnnotationSession
    ) -> None:
        kb_id = kb_item.get("id", None)

        update_data = {
            **kb_item,
            "problem_id": problem.pk,
            "session_id": session.pk,
        }

        if kb_id is None:
            self._create_kb_annotation(update_data, problem, user, session)
        else:
            self._update_kb_annotation(kb_id, update_data, problem, user, session)

    def _create_kb_annotation(
        self,
        update_data: dict,
        problem: Problem,
        user: User,
        session: AnnotationSession,
    ):
        serializer = KnowledgeBaseAnnotationSerializer(data=update_data)
        serializer.is_valid(raise_exception=True)
        annotation = serializer.save(problem=problem)
        self.create_kb_annotation_event(
            action=AnnotationEvent.Action.CREATED,
            kb_annotation=annotation,
            user=user,
            session=session,
        )

    def _update_kb_annotation(
        self,
        kb_id: int,
        update_data: dict,
        problem: Problem,
        user: User,
        session: AnnotationSession,
    ):
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
        validated_data: dict = serializer.validated_data  # type: ignore

        changed = any(
            getattr(kb_instance, field) != value
            for field, value in validated_data.items()
            if field in ("entity1", "entity2", "relationship", "notes")
        )

        if not changed:
            serializer.save(problem=problem)
            return

        before_state = {
            "entity1": kb_instance.entity1,
            "entity2": kb_instance.entity2,
            "relationship": kb_instance.relationship,
            "notes": kb_instance.notes,
        }
        annotation = serializer.save(problem=problem)
        self.create_kb_annotation_event(
            action=AnnotationEvent.Action.UPDATED,
            kb_annotation=annotation,
            user=user,
            session=session,
            pre_update_state=before_state,
        )

    def _mark_kb_not_in_input_as_removed(
        self,
        problem: Problem,
        kb_items: list[dict],
        user: User,
        session: AnnotationSession,
    ) -> None:
        """
        Deletes KnowledgeBase annotations for a problem that are not included
        in the provided list of kb_items.
        """
        kb_item_ids = {
            kb_item.get("id") for kb_item in kb_items if kb_item.get("id") is not None
        }

        annotations_to_delete = KnowledgeBaseAnnotation.objects.filter(
            problem=problem
        ).exclude(id__in=kb_item_ids)

        for annotation in annotations_to_delete:
            self.create_kb_annotation_event(
                action=AnnotationEvent.Action.REMOVED,
                kb_annotation=annotation,
                user=user,
                session=session,
            )
            annotation.delete()

    def handle_kb_annotations(
        self, problem: Problem, kb_items: list[dict], user: User
    ) -> None:
        """
        Creates, updates and deletes KnowledgeBase annotations for a problem.
        Creates an annotation session if it does not exist.
        """
        with transaction.atomic():
            session = AnnotationSession.objects.create(user=user)
            self._mark_kb_not_in_input_as_removed(problem, kb_items, user, session)
            for kb_item in kb_items:
                self._create_update_kb_annotation(kb_item, problem, user, session)

    def update(self, instance: Problem, validated_data: dict) -> Problem:
        """
        Updates a Problem from validated input data. Core fields (such as
        premises and hypothesis) are only updatable for user-created problems.
        """
        if instance.dataset == Problem.Dataset.USER:
            instance = self._update_core_problem_fields(instance, validated_data)
        instance = self._update_parse_fields(instance, validated_data)

        return instance

    def _update_core_problem_fields(
        self, instance: Problem, validated_data: dict
    ) -> Problem:
        """
        Updates core Problem fields (premises, hypothesis, base) from validated input data.
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

    def _update_parse_fields(self, instance: Problem, validated_data: dict) -> Problem:
        """
        Updates Problem fields that are generated during parsing
        (langproPrediction, usedKbItems).
        """
        validated_langpro_prediction = validated_data.get("langproPrediction", None)
        instance.langpro_prediction = validated_langpro_prediction

        instance.save()

        self._update_used_kb_items(instance, validated_data)

        return instance

    def _update_used_kb_items(self, instance: Problem, validated_data: dict) -> None:
        """
        Updates the used knowledge base items for a problem instance.
        """
        used_kb_items = validated_data.get("usedKbItems", [])
        instance.used_kb_items.all().delete()  # type: ignore
        UsedKnowledgeBaseItem.objects.bulk_create(
            UsedKnowledgeBaseItem(problem=instance, **item) for item in used_kb_items
        )

    def create_kb_annotation_event(
        self,
        action: AnnotationEvent.Action,
        kb_annotation: KnowledgeBaseAnnotation,
        user: User,
        session: AnnotationSession,
        pre_update_state: dict | None = None,
    ) -> None:
        """
        Creates an annotation event for adding a knowledge base item annotation.

        The `update_before_state` parameter is used to provide the state of the annotation before an update action.
        """
        match action:
            case AnnotationEvent.Action.CREATED:
                before_state = None
                after_state = {
                    "entity1": kb_annotation.entity1,
                    "entity2": kb_annotation.entity2,
                    "relationship": kb_annotation.relationship,
                    "notes": kb_annotation.notes,
                }
            case AnnotationEvent.Action.UPDATED:
                before_state = (
                    {
                        "entity1": pre_update_state["entity1"],
                        "entity2": pre_update_state["entity2"],
                        "relationship": pre_update_state["relationship"],
                        "notes": pre_update_state["notes"],
                    }
                    if pre_update_state is not None
                    else {}
                )
                after_state = {
                    "entity1": kb_annotation.entity1,
                    "entity2": kb_annotation.entity2,
                    "relationship": kb_annotation.relationship,
                    "notes": kb_annotation.notes,
                }
            case AnnotationEvent.Action.REMOVED:
                before_state = {
                    "entity1": kb_annotation.entity1,
                    "entity2": kb_annotation.entity2,
                    "relationship": kb_annotation.relationship,
                    "notes": kb_annotation.notes,
                }
                after_state = None

        AnnotationEvent.objects.create(
            session=session,
            problem=kb_annotation.problem,
            actor=user,
            action=action,
            event_type=AnnotationEvent.EventType.KNOWLEDGE_BASE,
            annotation_id=kb_annotation.pk,
            before_state=before_state,
            after_state=after_state,
        )


class GoldInputSerializer(serializers.Serializer):
    """
    Serializer for validating gold status toggle data.
    """

    gold = serializers.BooleanField(
        required=True, help_text="Indicates if the problem is gold."
    )


class VisibilityInputSerializer(serializers.Serializer):
    """
    Serializer for validating visibility toggle data.
    """

    hidden = serializers.BooleanField(
        required=True, help_text="Indicates if the problem is hidden."
    )
