from dataclasses import dataclass

from django.http import JsonResponse
from rest_framework.views import APIView

from problem.problem_details import get_related_problem_ids
from problem.models import Problem


@dataclass
class ProblemResponse:
    id: int | None = None
    index: int | None = None
    problem: Problem | None = None
    error: str | None = None
    next: str | None = None
    previous: str | None = None

    def json_response(self, status=200) -> JsonResponse:
        return JsonResponse(
            {
                "id": self.id,
                "index": self.index,
                "problem": self.problem.serialize() if self.problem else None,
                "error": self.error,
                "next": self.next,
                "previous": self.previous,
            },
            status=status,
        )


class ProblemView(APIView):
    def get(self, request, problem_id: int):
        try:
            problem = Problem.objects.get(id=problem_id)
        except Problem.DoesNotExist:
            return ProblemResponse(
                error="Problem not found",
            ).json_response(status=404)

        problem_index = problem.get_index()

        next_problem_id, previous_problem_id = (
            get_related_problem_ids(problem_id)
        )

        return ProblemResponse(
            id=problem.pk,
            index=problem_index,
            problem=problem,
            next=str(next_problem_id),
            previous=str(previous_problem_id),
        ).json_response(status=200)
