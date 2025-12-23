from rest_framework import serializers
from annotation.models import ProblemAnnotation, KnowledgeBaseAnnotation


class KnowledgeBaseAnnotationSerializer(serializers.ModelSerializer):
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
    kbs = KnowledgeBaseAnnotationSerializer(many=True, source="session.kb_annotations")

    class Meta:
        model = ProblemAnnotation
        fields = [
            "id",
            "entailment_label",
            "created_at",
        ]
