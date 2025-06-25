from dataclasses import dataclass
from typing import Literal
from django.http import JsonResponse
from rest_framework.views import APIView

from problem.models import Problem
from problem.types import CombinedProblem
from problem.services import (
    convert_to_subtype,
    get_related_problem_ids,
)


@dataclass
class ProblemResponse:
    id: int | None = None
    index: int | None = None
    type: Literal["sick", "fracas", "snli"] | None = None
    problem: CombinedProblem | None = None
    error: str | None = None
    next: str | None = None
    previous: str | None = None
    random: str | None = None

    def json_response(self, status=200) -> JsonResponse:
        return JsonResponse(
            {
                "id": self.id,
                "index": self.index,
                "type": self.type,
                "problem": self.problem.serialize() if self.problem else None,
                "error": self.error,
                "next": self.next,
                "previous": self.previous,
                "random": self.random,
            },
            status=status,
        )


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


class ProblemView(APIView):
    def get(self, request, problem_id: int):
        try:
            problem = Problem.objects.get(id=problem_id)
        except Problem.DoesNotExist:
            return ProblemResponse(
                error="Problem not found",
            ).json_response(status=404)

        converted_problem = convert_to_subtype(problem)

        problem_index = problem.get_index()

        if converted_problem is None:
            return ProblemResponse(
                error="Problem not found",
            ).json_response(status=404)

        next_problem_id, previous_problem_id, random_problem_id = (
            get_related_problem_ids(problem_id)
        )

        return ProblemResponse(
            id=problem.id,
            index=problem_index,
            type=problem.type,
            problem=converted_problem,
            next=next_problem_id,
            previous=previous_problem_id,
            random=random_problem_id,
        ).json_response(status=200)


class ProofBankStatsView(APIView):
    def get(self, request):
        first_problem = Problem.objects.order_by("id").first()
        last_problem = Problem.objects.order_by("-id").first()
        total_problems = Problem.objects.count()

        return ProofBankStatsResponse(
            first_problem_id=first_problem.id if first_problem else None,
            last_problem_id=last_problem.id if last_problem else None,
            total_problems=total_problems,
        ).json_response(status=200)
