from django.conf import settings
from django.db import models

from problem.models import Problem, Sentence


class AnnotationSession(models.Model):
    """
    Represents a session of annotations.
    """

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Session {self.pk} by {self.user.username} at {self.created_at}"


class SentenceAnnotation(models.Model):
    session = models.ForeignKey(
        AnnotationSession,
        on_delete=models.CASCADE,
        related_name="sentence_annotations",
    )

    sentence = models.ForeignKey(
        Sentence,
        on_delete=models.CASCADE,
        related_name="annotations",
    )

    text = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)


class ProblemAnnotation(models.Model):
    session = models.OneToOneField(
        AnnotationSession,
        on_delete=models.CASCADE,
        related_name="problem_annotation",
    )

    problem = models.ForeignKey(
        Problem,
        on_delete=models.CASCADE,
        related_name="annotations",
    )

    entailment_label = models.CharField(
        max_length=255,
        choices=Problem.EntailmentLabel.choices,
        default=Problem.EntailmentLabel.UNKNOWN,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        kbs = self.session.kb_annotations
        return dict(
            kb=[k.serialize() for k in kbs.all()]
        )


class KnowledgeBaseAnnotation(models.Model):
    class Relationship(models.TextChoices):
        EQUAL = "equal", "Equal"
        NOT_EQUAL = "not_equal", "Not Equal"
        SUBSET = "subset", "Subset"
        SUPERSET = "superset", "Superset"

    session = models.ForeignKey(
        AnnotationSession,
        on_delete=models.CASCADE,
        related_name="kb_annotations",
    )

    problem = models.ForeignKey(
        Problem,
        on_delete=models.CASCADE,
        related_name="kb_annotations",
    )

    entity1 = models.CharField(max_length=255)

    entity2 = models.CharField(max_length=255)

    relationship = models.CharField(
        max_length=255,
        choices=Relationship.choices,
        default=Relationship.EQUAL,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        return dict(entity1=self.entity1,
                    entity2=self.entity2,
                    relationship=self.relationship)
