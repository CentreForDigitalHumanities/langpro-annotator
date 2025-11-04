from dj_rest_auth.serializers import UserDetailsSerializer
from rest_framework import serializers


class CustomUserDetailsSerializer(UserDetailsSerializer):

    class Meta(UserDetailsSerializer.Meta):
        firstName = serializers.CharField(read_only=True, source='first_name')
        lastName = serializers.CharField(read_only=True, source='last_name')
        isStaff = serializers.BooleanField(read_only=True, source='is_staff')
        canEditOrAddProblem = serializers.BooleanField(read_only=True, source='can_edit_or_add_problem')

        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "is_staff",
            "role",
        )
        read_only_fields = ["is_staff", "id", "email"]
