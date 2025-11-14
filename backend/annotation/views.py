from rest_framework.views import APIView
from rest_framework.response import Response

from annotation.models import Label
from problem.serializers import LabelSerializer


class LabelListView(APIView):
    """API view to list all available labels."""

    def get(self, request) -> Response:
        """Return all available labels in the system."""
        labels = Label.objects.all().order_by("text")
        serializer = LabelSerializer(labels, many=True)
        return Response(serializer.data)
