import requests
from django.conf import settings
from dataclasses import dataclass, field, asdict

from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.request import Request

from langpro_annotator.logger import logger
from problem.utils import prepare_kb_for_parser


@dataclass
class ParseResponse:
    error: str | None = None
    data: dict | None = None

    def json_response(self, status=200) -> JsonResponse:
        return JsonResponse(
            asdict(self),
            status=status,
        )


@dataclass
class ParserInput:
    """Represents the input for the LangPro parser."""

    prover_config: list[str] = field(default_factory=lambda: ["allInt", "aall"])
    premises: list[str] = field(default_factory=list)
    kb: list[str] = field(default_factory=list)
    hypothesis: str = ""
    ral: int = 200
    senses: str = "all"


class ParseView(APIView):
    """Handles parsing requests."""

    def post(self, request: Request) -> JsonResponse:
        """
        Receives problem data, validates it, and passes it to the LangPro parser.
        """
        try:
            payload = request.data
            if not isinstance(payload, dict):
                return ParseResponse(error="Invalid request format").json_response(
                    status=400
                )

            kb_items = payload.get("kbItems", [])
            if kb_items:
                kb_items = prepare_kb_for_parser(kb_items)

            parser_input = ParserInput(
                premises=payload.get("premises", []),
                hypothesis=payload.get("hypothesis", ""),
                kb=kb_items,
            )

            response = self.send_to_parser(parser_input)

            return ParseResponse(data=response).json_response(status=200)

        except Exception as e:
            logger.exception(f"An error occurred in ParseView: {e}")
            return ParseResponse(error=str(e)).json_response(status=500)

    def send_to_parser(self, data: ParserInput) -> dict | None:
        """Send frontend data to downstream LangPro service."""

        logger.info(f"Sending to LangPro service: {asdict(data)}")

        params = asdict(data)
        # ask LangPro container to return results in a format suitable for
        # this application
        params['format'] = 'annotator'

        try:
            response = requests.post(
                url=f"{settings.LANGPRO_URL}/api/prove/",
                json=params,
                headers={"Content-Type": "application/json"},
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.exception(f"Error sending request to LangPro: {e}")
            raise
