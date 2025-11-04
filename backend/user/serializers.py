from dj_rest_auth.serializers import UserDetailsSerializer
from rest_framework import serializers


class CustomUserDetailsSerializer(UserDetailsSerializer):
    firstName = serializers.CharField(source='first_name')
    lastName = serializers.CharField(source='last_name')
    isStaff = serializers.BooleanField(read_only=True, source='is_staff')
    canEditOrAddProblem = serializers.BooleanField(read_only=True, source='can_edit_or_add_problem')

    class Meta(UserDetailsSerializer.Meta):

        fields = (
            "id",
            "username",
            "email",
            "firstName",
            "lastName",
            "isStaff",
            "role",
            "canEditOrAddProblem",
        )
        read_only_fields = ["isStaff", "id", "email"]
