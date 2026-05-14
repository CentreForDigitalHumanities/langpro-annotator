from dataclasses import dataclass

from django.http import QueryDict
from django.db.models import QuerySet, Q

from langpro_annotator.logger import logger
from problem.models import Problem
from user.models import User


@dataclass
class RelatedProblemIds:
    first: int | None = None
    previous: int | None = None
    next: int | None = None
    last: int | None = None
    total: int | None = None


def get_related_problem_ids(
    problem_qs: QuerySet[Problem],
    problem_id: int | None = None,
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
        first=first_problem.pk if first_problem else None,
        previous=previous_problem.pk if previous_problem else None,
        next=next_problem.pk if next_problem else None,
        last=last_problem.pk if last_problem else None,
        total=total,
    )


def get_filters(query_params: QueryDict, user: User | None = None) -> Q | None:
    """
    Constructs a Django Q object for filtering problems based on query parameters.
    Return None if no valid filters are found in the parameters.
    """
    dataset = query_params.get("dataset")
    entailment_label = query_params.get("entailmentLabel")
    gold = query_params.get("gold")
    text = query_params.get("text")
    hidden = query_params.get("hidden", None)

    user_can_see_hidden = user.can_see_hidden_problems if user else False

    filters = Q()
    if dataset:
        filters &= Q(dataset=dataset)
    if entailment_label:
        filters &= Q(entailment_label=entailment_label)
    if gold:
        logger.warning(f"Filtering by gold is not implemented yet.")
        pass
    if text:
        filters &= Q(
            Q(hypothesis__text__icontains=text) | Q(premises__text__icontains=text)
        )

    if not user_can_see_hidden:
        filters &= Q(hidden=False)
    elif hidden and hidden.lower() in ('true', 'false'):
        filters &= Q(hidden=hidden.lower() == 'true')

    return filters
