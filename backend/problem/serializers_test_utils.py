from unittest.mock import Mock
from problem.serializers import ProblemInputSerializer


def input_serializer_with_user(user) -> ProblemInputSerializer:
    """
    Helper function to create a ProblemInputSerializer with a mock request containing the specified user.
    """
    request = Mock(user=user)
    return ProblemInputSerializer(context={"request": request})
