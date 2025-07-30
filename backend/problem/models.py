from django.db import models
from django.contrib.postgres.fields import ArrayField

from problem.services import FracasData, SNLIData, SickData
from langpro_annotator.logger import logger


class Sentence(models.Model):
    text = models.TextField()


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

    extra_data = models.JSONField()

    def get_index(self) -> int | None:
        """
        Get the index of this Problem in the database.
        """
        try:
            return Problem.objects.filter(id__lte=self.pk).count()
        except Exception as e:
            logger.error(f"Error getting index for problem {self.pk}: {e}")
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
            "id": self.pk,
            "dataset": self.dataset,
            "premises": [premise.text for premise in self.premises.all()],
            "hypothesis": self.hypothesis.text,
            "entailmentLabel": self.entailment_label,
            "extraData": serialized_extra_data,
        }


class KnowledgeBase(models.Model):
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

    problem = models.ForeignKey(
        Problem,
        on_delete=models.CASCADE,
        related_name="knowledge_bases",
    )
