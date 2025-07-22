import json
from dataclasses import dataclass

from django.http import JsonResponse
from rest_framework.views import APIView

from langpro_annotator.common_settings import LANGPRO_URL
from langpro_annotator.http_client import http_client
from langpro_annotator.logger import logger

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

    def send_to_parser(self, data: dict) -> dict | None:
        """Send frontend data to downstream LangPro container."""
        langpro_response = http_client.request(
            method="POST",
            url=f"{LANGPRO_URL}/parse",
            body=json.dumps(data),
            headers={"Content-Type": "application/json"},
        )

        if langpro_response.status != 200:
            logger.warning(
                f"Failed to send data to LangPro: {langpro_response.status} {langpro_response.data}"
            )
            return None

        try:
            langpro_response_data = json.loads(langpro_response.data.decode("utf-8"))
        except json.JSONDecodeError as e:
            logger.warning(f"LangPro response is not JSON parseable: {e.msg}")
            return None

        return langpro_response_data
