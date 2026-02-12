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


class BaseAnnotation(models.Model):
    session = models.ForeignKey(
        AnnotationSession,
        on_delete=models.CASCADE,
        related_name="%(class)ss",
    )

    problem = models.ForeignKey(
        Problem,
        on_delete=models.CASCADE,
        related_name="%(class)ss",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="%(class)ss_created",
    )

    removed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When this annotation was removed from the problem.",
    )
    removed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="%(class)ss_removed",
        null=True,
        blank=True,
        help_text="User who removed this annotation.",
    )

    notes = models.TextField(
        blank=True,
        help_text="Optional notes explaining why this annotation was added or removed.",
    )

    class Meta:
        abstract = True

    def is_active(self) -> bool:
        """Check if this annotation is currently active (not removed)."""
        return self.removed_at is None


class KnowledgeBaseAnnotation(BaseAnnotation):
    class Relationship(models.TextChoices):
        EQUAL = "equal", "Equal"
        NOT_EQUAL = "not_equal", "Not Equal"
        SUBSET = "subset", "Subset"
        SUPERSET = "superset", "Superset"

    entity1 = models.CharField(max_length=255)

    entity2 = models.CharField(max_length=255)

    relationship = models.CharField(
        max_length=255,
        choices=Relationship.choices,
        default=Relationship.EQUAL,
    )

    def __str__(self):
        status = "active" if self.is_active() else f"removed at {self.removed_at}"
        return f"KB Annotation ({self.entity1} {self.relationship} {self.entity2}) on Problem {self.problem.pk} ({status})"


class Label(models.Model):
    text = models.CharField(max_length=255)
    description = models.TextField(
        help_text="A detailed description of the label, indicating when it should be used."
    )

    class Meta:
        ordering = ["text"]

    def __str__(self):
        return self.text


class LabelAnnotation(BaseAnnotation):
    """
    The attachment of a label to a problem.

    Each time a label is attached to a problem, a new LabelAnnotation record
    is created. When removed, the record is marked as removed (not deleted),
    so the history of labelings is preserved.
    """
    label = models.ForeignKey(
        Label,
        on_delete=models.CASCADE,
        related_name="label_annotations",
    )

    class Meta(BaseAnnotation.Meta):
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["problem", "removed_at"]),
            models.Index(fields=["label", "removed_at"]),
        ]
        permissions = [
            (
                "delete_own_labelannotation",
                "Can remove own label annotation from problems",
            ),
            (
                "delete_any_labelannotation",
                "Can remove any label annotation from problems",
            ),
        ]

    def __str__(self):
        status = "active" if self.is_active() else f"removed at {self.removed_at}"
        return f"Label '{self.label.text}' on Problem {self.problem.pk} ({status})"

    def is_attached_by_user(self, user) -> bool:
        """Check if this label annotation was created by the given user."""
        return self.created_by == user
