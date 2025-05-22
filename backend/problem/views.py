from dataclasses import dataclass
from django.http import JsonResponse
from rest_framework.views import APIView

from problem.types import CombinedProblem
from problem.services import get_problem_by_id


@dataclass
class ProblemResponse:
    problem: CombinedProblem | None
    error: str | None = None


class ProblemView(APIView):
    def get(self, request, problem_id: int):
        problem = get_problem_by_id(problem_id)

        if problem is None:
            return JsonResponse({"error": "Problem not found"}, status=404)

        return JsonResponse({"problem": problem.__dict__})
