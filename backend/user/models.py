import django.contrib.auth.models as django_auth_models
from django.db import models


class User(django_auth_models.AbstractUser):
    """
    Core user model used for authentication.
    """

    # Only extend this model with information that is relevant for
    # authentication; for things like settings and preferences, add
    # a UserProfile model.

    class Meta:
        db_table = "auth_user"

    class Role(models.TextChoices):
        ANNOTATOR = "annotator", "Annotator"
        MASTER_ANNOTATOR = "master_annotator", "Master Annotator"
        VISITOR = "visitor", "Visitor"

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.VISITOR,
        help_text="Visitors can browse problems and parses. Annotators can annotate non-locked problems. Master Annotators can manage users, change problem lock status, and review annotations.",
    )
    @property
    def can_edit_or_add_problem(self) -> bool:
        """
        Determines whether the user can edit or add problems.
        """
        return self.is_superuser or self.role in [self.Role.MASTER_ANNOTATOR]
