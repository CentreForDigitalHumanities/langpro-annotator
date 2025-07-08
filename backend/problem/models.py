from django.db import models
from django.contrib.postgres.fields import ArrayField

from problem.services import FracasData, SNLIData, SickData
from langpro_annotator.logger import logger


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
        UNKNOWN = "unknown", "Unknown"

    dataset = models.CharField(
        max_length=255,
        choices=Dataset.choices,
        default=Dataset.USER,
    )

    premises = ArrayField(
        models.CharField(max_length=512),
        default=list,
    )

    hypothesis = models.CharField(
        max_length=512,
        blank=True,
        null=True,
    )

    entailment_label = models.CharField(
        max_length=255,
        choices=EntailmentLabel.choices,
        default=EntailmentLabel.UNKNOWN,
    )

    extra_data = models.JSONField()

    def get_index(self) -> int | None:
        """
        Get the index of this Problem in the database.
        """
        try:
            return Problem.objects.filter(id__lte=self.id).count()
        except Exception as e:
            logger.error(f"Error getting index for problem {self.id}: {e}")
            return None

    def serialize(self) -> dict:
        """
        Serialize the Problem instance to a dictionary.
        """

        match self.dataset:
            case self.Dataset.SICK:
                serialized_extra_data = SickData.serialize(self.extra_data)
            case self.Dataset.FRACAS:
                serialized_extra_data = FracasData.serialize(self.extra_data)
            case self.Dataset.SNLI:
                serialized_extra_data = SNLIData.serialize(self.extra_data)
            case _:
                serialized_extra_data = {}

        return {
            "id": self.id,
            "dataset": self.dataset,
            "premises": self.premises,
            "hypothesis": self.hypothesis,
            "entailmentLabel": self.entailment_label,
            "extraData": serialized_extra_data,
        }
