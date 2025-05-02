from django.db import models
from django.core.validators import MinValueValidator


class SickProblem(models.Model):
    class Entailment(models.TextChoices):
        NEUTRAL = "neutral", "Neutral"
        CONTRADICTION = "contradiction", "Contradiction"
        ENTAILMENT = "entailment", "Entailment"

    class Dataset(models.TextChoices):
        TRAIN = "train", "Train"
        TEST = "test", "Test"
        TRIAL = "trial", "Trial"

    pair_id = models.IntegerField(unique=True)

    sentence_one = models.CharField(max_length=255)
    sentence_two = models.CharField(max_length=255)

    entailment_label = models.CharField(max_length=20, choices=Entailment.choices)

    relatedness_score = models.DecimalField(
        max_digits=4,
        decimal_places=3,
        validators=[MinValueValidator(1), MinValueValidator(5)],
    )
