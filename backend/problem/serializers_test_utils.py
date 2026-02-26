from unittest.mock import Mock
from problem.serializers import ProblemInputSerializer
from user.models import User


def input_serializer_with_user(
    user: User, data: dict | None = None, instance=None
) -> ProblemInputSerializer:
    """
    Helper function to create a ProblemInputSerializer with a mock request
    containing the specified user. The data argument can be used to provide
    initial data for the serializer.
    """
    return ProblemInputSerializer(
        data=data, instance=instance, context={"request": Mock(user=user)}
    )
