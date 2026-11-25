from django.conf import settings
from django.db import models
from django.utils import timezone

from problem.models import KnowledgeBaseItem, Problem, Sentence


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
    """Abstract base class for KnowledgeBaseAnnotation and LabelAnnotation."""

    problem = models.ForeignKey(
        Problem,
        on_delete=models.CASCADE,
        related_name="%(class)ss",
    )

    notes = models.TextField(
        blank=True,
        help_text="Optional notes explaining why this annotation was added or removed.",
    )

    class Meta:
        abstract = True

    def is_created_by_user(self, user) -> bool:
        """Check if this annotation was created by the given user."""
        if isinstance(self, KnowledgeBaseAnnotation):
            event_type = AnnotationEvent.EventType.KNOWLEDGE_BASE
        elif isinstance(self, LabelAnnotation):
            event_type = AnnotationEvent.EventType.LABEL
        else:
            return False

        created_event = (
            AnnotationEvent.objects.filter(event_type=event_type, annotation_id=self.pk)
            .order_by("-occurred_at")
            .first()
        )
        return (
            created_event is not None
            and created_event.action == AnnotationEvent.Action.CREATED
            and created_event.actor == user
        )


class KnowledgeBaseAnnotation(KnowledgeBaseItem, BaseAnnotation):
    """Marks the current attachment of a knowledge base item to a problem."""

    pass

    def __str__(self):
        return f"KB Annotation ({self.entity1} {self.relationship} {self.entity2}) on Problem {self.problem.pk}"


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
    """Marks the current attachment of a label to a problem."""

    label = models.ForeignKey(
        Label,
        on_delete=models.CASCADE,
        related_name="label_annotations",
    )

    class Meta(BaseAnnotation.Meta):
        indexes = [
            models.Index(fields=["problem"]),
            models.Index(fields=["label"]),
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
        return f"Label '{self.label.text}' on Problem {self.problem.pk}"


class AnnotationEvent(models.Model):
    class EventType(models.TextChoices):
        KNOWLEDGE_BASE = "knowledgeBase", "Knowledge base"
        LABEL = "label", "Label"
        STATUS = "status", "Status"

    class Action(models.TextChoices):
        CREATED = "created", "Created"
        UPDATED = "updated", "Updated"
        REMOVED = "removed", "Removed"

    session = models.ForeignKey(
        AnnotationSession,
        on_delete=models.CASCADE,
        related_name="annotation_events",
        help_text="Groups annotations that were performed in the same operation.",
    )
    problem = models.ForeignKey(
        Problem,
        on_delete=models.CASCADE,
        related_name="annotation_events",
    )
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="annotation_events",
    )
    event_type = models.CharField(
        max_length=16,
        choices=EventType.choices,
    )
    # This cannot be a ForeignKey, because the annotation may be deleted, and
    # it may refer to either a KnowledgeBaseAnnotation or a LabelAnnotation.
    annotation_id = models.PositiveBigIntegerField(
        blank=True,
        null=True,
        help_text="ID of the annotation (KnowledgeBaseAnnotation or LabelAnnotation) associated with this event, if applicable.",
    )
    action = models.CharField(max_length=16, choices=Action.choices)
    occurred_at = models.DateTimeField(default=timezone.now)
    before_state = models.JSONField(null=True, blank=True)
    after_state = models.JSONField(null=True, blank=True)

    class Meta:
        ordering = ["-occurred_at"]
        indexes = [
            models.Index(fields=["problem", "occurred_at"]),
            models.Index(fields=["event_type", "annotation_id"]),
        ]
