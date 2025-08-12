from dataclasses import dataclass
from typing import Optional

from django.http import JsonResponse
from rest_framework.views import APIView, Request

from problem.problem_details import get_filters, get_related_problem_ids
from problem.models import Problem


@dataclass
class ProblemResponse:
    id: Optional[int] = None
    index: Optional[int] = None
    problem: Optional[Problem] = None
    error: Optional[str] = None

    first: Optional[str] = None
    previous: Optional[str] = None
    next: Optional[str] = None
    last: Optional[str] = None
    total: Optional[int] = None

    def json_response(self, status=200) -> JsonResponse:
        return JsonResponse(
            {
                "id": self.id,
                "index": self.index,
                "problem": self.problem.serialize() if self.problem else None,
                "error": self.error,
                "firstProblemId": self.first,
                "previousProblemId": self.previous,
                "nextProblemId": self.next,
                "lastProblemId": self.last,
                "totalProblems": self.total if self.total is not None else 0,
            },
            status=status,
        )


class ProblemView(APIView):
    def get(self, request: Request, problem_id: int | None):
        filters = get_filters(request.query_params)

        qs = Problem.objects.all()
        if filters is not None:
            qs = qs.filter(filters)

        try:
            problem = qs.get(id=problem_id)
        except Problem.DoesNotExist:
            # The selected problem may not be part of the selected filters.
            # In that case, we simply take the first problem from the queryset.
            problem = qs.first()

        problem_index = problem.get_index() if problem else None
        related_problem_ids = get_related_problem_ids(qs, problem_id)

        return ProblemResponse(
            id=problem.pk if problem else None,
            index=problem_index,
            problem=problem,
            first=str(related_problem_ids.first),
            previous=str(related_problem_ids.previous),
            next=str(related_problem_ids.next),
            last=str(related_problem_ids.last),
            total=related_problem_ids.total,
        ).json_response(status=200)
