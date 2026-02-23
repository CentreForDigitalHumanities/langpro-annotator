from enum import StrEnum
import django.contrib.auth.models as django_auth_models

from annotation.models import LabelAnnotation


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

    @property
    def can_edit_kb(self) -> bool:
        """
        Determines whether the user can edit knowledge base items.

        This includes adding, editing and deleting, as these are all part of
        the same permission in our current implementation.
        """
        return self.has_perm("annotation.change_knowledgebaseannotation")

    @property
    def can_add_label_annotations(self) -> bool:
        """
        Determines whether the user can add label annotations.
        """
        return self.has_perm("annotation.add_labelannotation")

    def can_remove_label_annotation(self, label_annotation: LabelAnnotation) -> bool:
        """
        Determines whether the user can mark a specific label annotation as removed.
        """
        if self.is_superuser or self.has_perm("annotation.delete_any_labelannotation"):
            return True

        if self.has_perm("annotation.delete_own_labelannotation"):
            return label_annotation.created_by.pk == self.pk

        return False
