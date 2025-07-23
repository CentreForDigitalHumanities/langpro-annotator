from dataclasses import dataclass, field, asdict

from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.request import Request

from problem.types import KnowledgeBase
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


@dataclass
class ParserInput:
    """Represents the input for the LangPro parser."""

    prover_config: list[str] = field(default_factory=lambda: ["allInt", "aall"])
    premises: list[str] = field(default_factory=list)
    knowledge_bases: list[KnowledgeBase] = field(default_factory=list)
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

            parser_input = ParserInput(
                premises=payload.get("premises", []),
                hypothesis=payload.get("hypothesis", ""),
                knowledge_bases=[
                    KnowledgeBase(**kb) for kb in payload.get("kbItems", [])
                ],
            )

            response = self.send_to_parser(parser_input)

            return ParseResponse(data=response).json_response(status=200)

        except Exception as e:
            logger.error(f"An error occurred in ParseView: {e}")
            return ParseResponse(error=str(e)).json_response(status=500)

    def send_to_parser(self, data: ParserInput) -> dict | None:
        """Send frontend data to downstream LangPro service."""

        print("Sending to LangPro service:", asdict(data))

        # try:
        #     langpro_response = http_client.request(
        #         method="POST",
        #         url=f"{LANGPRO_URL}/parse",
        #         body=json.dumps(data.to_dict()),
        #         headers={"Content-Type": "application/json"},
        #     )
        # except Exception as e:
        #     logger.error(f"Error sending request to LangPro: {e}")

        # Process data as needed...

        return {"ok": "true"}
