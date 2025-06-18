from dataclasses import dataclass
from typing import Literal, Optional
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
    id: Optional[int] = None
    type: Optional[Literal["sick", "fracas"]] = None
    problem: Optional[CombinedProblem] = None
    error: Optional[str] = None
    next: Optional[str] = None
    previous: Optional[str] = None
    random: Optional[str] = None

    def json_response(self, status=200) -> JsonResponse:
        return JsonResponse(
            {
                "id": self.id,
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
    error: Optional[str] = None
    first_problem_id: Optional[int] = None
    last_problem_id: Optional[int] = None
    total_problems: Optional[int] = None

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
            return None

        converted_problem = convert_to_subtype(problem)

        if problem is None:
            return ProblemResponse(
                error="Problem not found",
            ).json_response(status=404)

        next_problem_id, previous_problem_id, random_problem_id = (
            get_related_problem_ids(problem_id)
        )

        return ProblemResponse(
            id=problem.id,
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
