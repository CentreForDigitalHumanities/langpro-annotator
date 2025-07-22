from dataclasses import dataclass

from django.http import JsonResponse
from rest_framework.views import APIView

@dataclass
class ParseResponse:
    error: str | None = None
    data: dict | None = None

    def json_response(self, status=200) -> JsonResponse:
        return JsonResponse(
            {
                "error": self.error,
                "data": self.data,
            },
            status=status,
        )

class ParseView(APIView):
    def post(self, request):
        try:
            data = request.data
            if not isinstance(data, dict):
                raise ValueError("Invalid data format")

            parsed_data: dict = {"test": "ok"}

            return ParseResponse(data=parsed_data).json_response(status=200)

        except Exception as e:
            return ParseResponse(error=str(e)).json_response(status=400)
