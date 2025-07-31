from django.conf import settings
from django.db import models

from problem.models import KnowledgeBase, Problem, Sentence


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


class KnowledgeBaseAnnotation(models.Model):
    session = models.ForeignKey(
        AnnotationSession,
        on_delete=models.CASCADE,
        related_name="kb_annotations",
    )

    knowledge_base = models.ForeignKey(
        KnowledgeBase,
        on_delete=models.CASCADE,
        related_name="kb_annotations",
    )

    entity1 = models.CharField(max_length=255)

    entity2 = models.CharField(max_length=255)

    relationship = models.CharField(
        max_length=255,
        choices=KnowledgeBase.Relationship.choices,
        default=KnowledgeBase.Relationship.EQUAL,
    )
