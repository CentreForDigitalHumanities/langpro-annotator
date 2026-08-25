from dj_rest_auth.serializers import UserDetailsSerializer
from rest_framework import serializers


class CustomUserDetailsSerializer(UserDetailsSerializer):
    firstName = serializers.CharField(source="first_name")
    lastName = serializers.CharField(source="last_name")
    isStaff = serializers.BooleanField(read_only=True, source="is_staff")
    role = serializers.CharField(read_only=True)
    canEditProblem = serializers.BooleanField(read_only=True, source="can_edit_problem")
    canCreateProblem = serializers.BooleanField(
        read_only=True, source="can_create_problem"
    )
    canEditKb = serializers.BooleanField(read_only=True, source="can_edit_kb")
    canAddLabelAnnotations = serializers.BooleanField(
        read_only=True, source="can_add_label_annotations"
    )
    canCopyProblem = serializers.BooleanField(read_only=True, source="can_copy_problem")
    canChangeProblemVisibility = serializers.BooleanField(
        read_only=True, source="can_change_problem_visibility"
    )
    canChangeProblemStatus = serializers.BooleanField(
        read_only=True, source="can_change_problem_status"
    )

    class Meta(UserDetailsSerializer.Meta):

        fields = (
            "id",
            "username",
            "email",
            "firstName",
            "lastName",
            "isStaff",
            "role",
            "canEditProblem",
            "canCreateProblem",
            "canEditKb",
            "canAddLabelAnnotations",
            "canCopyProblem",
            "canChangeProblemVisibility",
            "canChangeProblemStatus",
        )
        read_only_fields = ["isStaff", "id", "email"]
