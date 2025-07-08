from django.db import models

from langpro_annotator.logger import logger


class Problem(models.Model):
    class ProblemType(models.TextChoices):
        SICK = "sick", "Sick"
        FRACAS = "fracas", "FraCaS"
        SNLI = "snli", "SNLI"

    type = models.CharField(
        max_length=255,
        choices=ProblemType.choices,
    )

    content = models.JSONField()

    def get_index(self) -> int | None:
        """
        Get the index of this Problem in the database.
        """
        try:
            return Problem.objects.filter(id__lte=self.id).count()
        except Exception as e:
            logger.error(f"Error getting index for problem {self.id}: {e}")
            return None
