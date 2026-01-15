from enum import StrEnum
import django.contrib.auth.models as django_auth_models

from annotation.models import Labeling


class GroupName(StrEnum):
    MASTER_ANNOTATORS = "Master Annotators"
    ANNOTATORS = "Annotators"


class UserRole(StrEnum):
    SUPERUSER = "superuser"
    MASTER_ANNOTATOR = "master_annotator"
    ANNOTATOR = "annotator"
    VISITOR = "visitor"


class User(django_auth_models.AbstractUser):
    """
    Core user model used for authentication.
    """

    # Only extend this model with information that is relevant for
    # authentication; for things like settings and preferences, add
    # a UserProfile model.

    class Meta:
        db_table = "auth_user"

    @property
    def role(self) -> str:
        """
        Returns the role of the user based on their group membership.

        Currently only used in the frontend to pick a user icon.
        """
        if self.is_superuser:
            return UserRole.SUPERUSER
        elif self.groups.filter(name=GroupName.MASTER_ANNOTATORS).exists():
            return UserRole.MASTER_ANNOTATOR
        elif self.groups.filter(name=GroupName.ANNOTATORS).exists():
            return UserRole.ANNOTATOR
        else:
            return UserRole.VISITOR

    @property
    def can_edit_problem(self) -> bool:
        """
        Determines whether the user can edit problems.
        """
        return self.has_perm("problem.change_problem")

    @property
    def can_create_problem(self) -> bool:
        """
        Determines whether the user can create new problems.
        """
        return self.has_perm("problem.add_problem")

    def can_remove_labeling(self, labeling: Labeling) -> bool:
        """
        Determines whether the user can remove a specific labeling.
        """
        if self.is_superuser or self.has_perm("annotation.delete_any_labeling"):
            return True

        if self.has_perm("annotation.delete_own_labeling"):
            return labeling.attached_by.pk == self.pk

        return False
