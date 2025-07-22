from dataclasses import dataclass

from django.http import JsonResponse
from rest_framework.views import APIView

from problem.models import Problem

@dataclass
class ProofBankStatsResponse:
    error: str | None = None
    first_problem_id: int | None = None
    last_problem_id: int | None = None
    total_problems: int | None = None

    def json_response(self, status=200) -> JsonResponse:
        return JsonResponse(
            {
                "error": self.error,
                "firstProblemId": self.first_problem_id,
                "lastProblemId": self.last_problem_id,
                "totalProblems": self.total_problems,
            },
            status=status,
        )


class ProofBankStatsView(APIView):
    def get(self, request):
        first_problem = Problem.objects.order_by("id").first()
        last_problem = Problem.objects.order_by("-id").first()
        total_problems = Problem.objects.count()

        return ProofBankStatsResponse(
            first_problem_id=first_problem.pk if first_problem else None,
            last_problem_id=last_problem.pk if last_problem else None,
            total_problems=total_problems,
        ).json_response(status=200)
