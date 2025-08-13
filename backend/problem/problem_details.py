from typing import Optional
from dataclasses import dataclass

from django.http import QueryDict
from django.db.models import QuerySet, Q

from langpro_annotator.logger import logger
from problem.models import Problem


@dataclass
class RelatedProblemIds:
    first: Optional[str] = None
    previous: Optional[str] = None
    next: Optional[str] = None
    last: Optional[str] = None
    total: Optional[int] = None


def get_related_problem_ids(
    problem_qs: QuerySet[Problem],
    problem_id: Optional[int],
) -> RelatedProblemIds:
    """
    Retrieves the IDs of surrounding problem objects
    in the database relative to the given problem ID.
    """
    problems = problem_qs.order_by("id")
    first_problem = problems.first()
    last_problem = problems.last()
    previous_problem = None
    next_problem = None
    total = problems.count()

    if problem_id is None:
        problem = None
    else:
        try:
            problem = problem_qs.get(id=problem_id)
            previous_problem = problems.filter(id__lt=problem.pk).last()
            next_problem = problems.filter(id__gt=problem.pk).first()
        except Problem.DoesNotExist:
            logger.warning(f"Problem ID {problem_id} does not exist.")
            problem = None

    return RelatedProblemIds(
        first=str(first_problem.pk) if first_problem else None,
        previous=str(previous_problem.pk) if previous_problem else None,
        next=str(next_problem.pk) if next_problem else None,
        last=str(last_problem.pk) if last_problem else None,
        total=total,
    )


def get_filters(query_params: QueryDict) -> Q | None:
    """
    Constructs a Django Q object for filtering problems based on query parameters.
    Return None if no valid filters are found in the parameters.
    """
    dataset = query_params.get("dataset")
    entailment_label = query_params.get("entailmentLabel")
    gold = query_params.get("gold")
    text = query_params.get("text")

    if not (dataset or entailment_label or gold or text):
        return None

    filters = Q()
    if dataset:
        filters &= Q(dataset=dataset)
    if entailment_label:
        filters &= Q(entailment_label=entailment_label)
    if gold is not None:
        # To be implemented!
        pass
    if text:
        filters &= Q(hypothesis__text__icontains=text) | Q(
            premises__text__icontains=text
        )

    return filters
