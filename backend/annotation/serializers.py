from rest_framework import serializers
from annotation.models import (
    AnnotationSession,
    ProblemAnnotation,
    KnowledgeBaseAnnotation,
)


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
