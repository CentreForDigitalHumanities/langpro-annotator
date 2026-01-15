from rest_framework import serializers
from annotation.models import (
    AnnotationSession,
    KnowledgeBaseAnnotation,
)
from annotation.serializers import (
    AnnotationSerializer,
    KnowledgeBaseAnnotationSerializer,
)
from problem.services import FracasData, SNLIData, SickData
from problem.models import Problem, Sentence


class ProblemSerializer(serializers.ModelSerializer):
    """
    Serializer for Problem model output.
    Handles serialization of problems with all related data including labels.
    """

    premises = serializers.SerializerMethodField()
    hypothesis = serializers.SerializerMethodField()
    entailmentLabel = serializers.CharField(source="entailment_label")
    extraData = serializers.SerializerMethodField()
    annotation = serializers.SerializerMethodField()

    class Meta:
        model = Problem
        fields = [
            "id",
            "dataset",
            "premises",
            "hypothesis",
            "entailmentLabel",
            "extraData",
            "annotation",
            "base",
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

    def get_annotation(self, problem: Problem):
        request = self.context.get("request")
        if not request or not request.user:
            return None
        return AnnotationSerializer(
            {}, context={"problem": problem, "user": request.user}
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
            self._handle_kb_annotations(problem, kb_items)

        return problem

    def _handle_kb_annotations(self, problem: Problem, kb_items: list[dict]) -> None:
        """
        Create or update KnowledgeBaseAnnotation items for a problem.
        Creates AnnotationSession and ProblemAnnotation if they don't exist.
        """
        request = self.context.get("request")
        if not request or not request.user:
            return

        user = request.user

        session = AnnotationSession.objects.create(user=user)

        for kb_item in kb_items:
            kb_id = kb_item.get("id", None)
            kb_serializer = KnowledgeBaseAnnotationSerializer()

            if kb_id is None:
                # Create new KnowledgeBaseAnnotation
                KnowledgeBaseAnnotation.objects.create(
                    session=session,
                    problem=problem,
                    entity1=kb_item["entity1"],
                    entity2=kb_item["entity2"],
                    relationship=kb_item["relationship"],
                )
            else:
                # Update existing KnowledgeBaseAnnotation
                try:
                    kb_instance = KnowledgeBaseAnnotation.objects.get(
                        id=kb_id, problem=problem, session=session
                    )
                    kb_serializer.update(kb_instance, kb_item)
                except KnowledgeBaseAnnotation.DoesNotExist:
                    raise serializers.ValidationError(
                        f"KnowledgeBaseAnnotation with ID {kb_id} does not exist "
                        f"for this problem and session."
                    )

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

        kb_items = validated_data.get("kbItems", [])
        if kb_items:
            self._handle_kb_annotations(instance, kb_items)

        return instance


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

    base = serializers.IntegerField(required=False, allow_null=True)

    kbItems = serializers.ListField(
        child=KnowledgeBaseAnnotationSerializer(),
        required=False,
        allow_empty=True,
        help_text="List of knowledge base annotations",
    )

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
