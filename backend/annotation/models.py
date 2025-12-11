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

    created_at = models.DateTimeField(auto_now_add=True)


class Label(models.Model):
    text = models.CharField(max_length=255)
    description = models.TextField(
        help_text="A detailed description of the label, indicating when it should be used."
    )

    class Meta:
        ordering = ["text"]

    def __str__(self):
        return self.text


class Labeling(models.Model):
    """
    The attachment of a label to a problem.

    Each time a label is attached to a problem, a new Labeling record is created.
    When removed, the record is marked as removed (not deleted), so the history of labelings is preserved.
    """

    problem = models.ForeignKey(
        Problem,
        on_delete=models.CASCADE,
        related_name="labelings",
    )

    label = models.ForeignKey(
        Label,
        on_delete=models.CASCADE,
        related_name="labelings",
    )

    attached_at = models.DateTimeField(auto_now_add=True)
    attached_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="labelings_attached",
    )

    removed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When this label was removed from the problem.",
    )
    removed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="labelings_removed",
        null=True,
        blank=True,
        help_text="User who removed this label.",
    )

    notes = models.TextField(
        blank=True,
        help_text="Optional notes explaining why this label was added or removed.",
    )

    class Meta:
        ordering = ["-attached_at"]
        indexes = [
            models.Index(fields=["problem", "removed_at"]),
            models.Index(fields=["label", "removed_at"]),
        ]
        permissions = [
            ("delete_own_labeling", "Can remove own labeling from problems"),
            ("delete_any_labeling", "Can remove any labeling from problems"),
        ]


    def is_active(self) -> bool:
        """Check if this labeling is currently active (not removed)."""
        return self.removed_at is None

    def __str__(self):
        status = "active" if self.is_active() else f"removed at {self.removed_at}"
        return f"Label '{self.label.text}' on Problem {self.problem.pk} ({status})"
