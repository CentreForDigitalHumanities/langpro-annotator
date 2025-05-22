from django.db import models


class Problem(models.Model):
    class ProblemType(models.TextChoices):
        SICK = "sick", "Sick"
        FRACAS = "fracas", "FraCaS"

    type = models.CharField(
        max_length=255,
        choices=ProblemType.choices,
    )

    content = models.JSONField()
