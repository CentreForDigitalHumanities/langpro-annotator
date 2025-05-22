from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


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
        validators=[
            MinValueValidator(1),
            MaxValueValidator(5),
        ],
    )


class FracasProblem(models.Model):
    class FracasAnswer(models.TextChoices):
        YES = "yes", "Yes"
        NO = "no", "No"
        UNKNOWN = "unknown", "Unknown"
        UNDEF = "undef", "Undef"

    fracas_id = models.IntegerField(unique=True)

    # Four problems do not have a question.
    question = models.CharField(
        max_length=255,
        help_text="The question from the original FraCaS problem. 4 problems do not have a question.",
    )

    hypothesis = models.CharField(
        max_length=255,
        help_text="The answer formulated as a hypothesis by McCartney.",
    )

    answer = models.CharField(
        max_length=255,
        help_text='The answer from the original FraCaS problem. Most are "Yes", "No", or "Don\'t know", but not always.',
    )

    fracas_answer = models.CharField(
        max_length=20,
        choices=FracasAnswer.choices,
        help_text="The answer constrained to one of a fixed set of values by McCartney.",
    )

    fracas_non_standard = models.BooleanField(
        help_text='Indicates whether the answer in the origianl FraCaS problem is non-standard (i.e. not "Yes", "No", or "Don\'t know")'
    )

    note = models.TextField(
        help_text="Note given by McCartney to explain issues arising during translation to XML."
    )

    section_name = models.CharField(
        max_length=255,
        help_text="The section name from the original FraCaS problem.",
    )

    subsection_name = models.CharField(
        max_length=255,
        help_text="The subsection name from the original FraCaS problem.",
    )


class FracasPremise(models.Model):
    class Meta:
        unique_together = ("fracas_problem", "premise_index")

    fracas_problem = models.ForeignKey(
        FracasProblem,
        on_delete=models.CASCADE,
        related_name="premises",
    )

    premise_index = models.IntegerField(
        help_text="The index of the premise in the original FraCaS problem.",
    )

    premise = models.CharField(
        max_length=255,
        help_text="The premise from the original FraCaS problem.",
    )
