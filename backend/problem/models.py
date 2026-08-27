from django.db import models
from django.db.models import QuerySet

from langpro_annotator.logger import logger


class Sentence(models.Model):
    text = models.TextField()

    def __str__(self):
        return self.text


class Problem(models.Model):
    class Dataset(models.TextChoices):
        SICK = "sick", "Sick"
        FRACAS = "fracas", "FraCaS"
        SNLI = "snli", "SNLI"
        USER = "user", "User"

    class EntailmentLabel(models.TextChoices):
        NEUTRAL = "neutral", "Neutral"
        ENTAILMENT = "entailment", "Entailment"
        CONTRADICTION = "contradiction", "Contradiction"
        CONFLICT = "conflict", "Conflict"
        UNKNOWN = "unknown", "Unknown"

    class Status(models.TextChoices):
        GOLD = "gold", "Gold"
        SILVER = "silver", "Silver"
        BRONZE = "bronze", "Bronze"

    dataset = models.CharField(
        max_length=255,
        choices=Dataset.choices,
        default=Dataset.USER,
    )

    base = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="derived_problems",
        help_text="The base problem from which this problem was derived, if any.",
    )

    premises = models.ManyToManyField(
        Sentence,
        related_name="premise_problems",
    )

    hypothesis = models.ForeignKey(
        Sentence,
        on_delete=models.PROTECT,
        related_name="hypothesis_problems",
    )

    entailment_label = models.CharField(
        max_length=255,
        choices=EntailmentLabel.choices,
        default=EntailmentLabel.UNKNOWN,
    )

    hidden = models.BooleanField(default=False)

    gold = models.BooleanField(default=False)

    langpro_prediction = models.CharField(
        max_length=255,
        choices=EntailmentLabel.choices,
        null=True,
        blank=True,
        default=None,
    )

    extra_data = models.JSONField()

    class Meta:
        permissions = [
            ("view_gold_problems", "Can view gold problems"),
            ("view_silver_problems", "Can view silver problems"),
            ("view_hidden_problems", "Can view hidden problems"),
            ("copy_problems", "Can copy problems"),
            ("change_problem_status", "Can change problem status"),
            ("change_problem_visibility", "Can change problem visibility"),
        ]

    def get_index(self, qs: QuerySet) -> int | None:
        """
        Get the index of this Problem in a given queryset of problems, ordered by pk.
        """
        try:
            return qs.filter(id__lte=self.pk).count()
        except Exception as e:
            logger.exception(f"Error getting index for problem {self.pk}: {e}")
            return None

    @property
    def status(self) -> "Problem.Status":
        """
        Returns the computed status of this problem:
        - GOLD if the problem is marked as gold.
        - SILVER if not gold but has active annotations (KB items or labels).
        - BRONZE otherwise (no annotations).
        """
        if self.gold:
            return Problem.Status.GOLD
        has_annotations = (
            self.knowledgebaseannotations.filter(removed_at__isnull=True).exists()
            or self.labelannotations.filter(removed_at__isnull=True).exists()
        )
        return Problem.Status.SILVER if has_annotations else Problem.Status.BRONZE

    def __str__(self):
        return f"Problem {self.pk} [{self.status}] ({self.get_dataset_display()}): {self.get_entailment_label_display()}"  # type: ignore
