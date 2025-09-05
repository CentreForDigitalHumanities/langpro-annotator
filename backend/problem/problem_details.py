from typing import Tuple
from langpro_annotator.logger import logger
from problem.models import Problem


def get_related_problem_ids(
    problem_id: int,
) -> Tuple[int | None, int | None]:
    """
    Retrieves the IDs of the next and previous Problem objects
    in the database relative to the given problem ID.
    """

    try:
        problem = Problem.objects.get(id=problem_id)
    except Problem.DoesNotExist:
        logger.warning(f"Problem ID {problem_id} does not exist.")
        return None, None

    next_problem = Problem.objects.filter(id__gt=problem.pk).order_by("id").first()
    previous_problem = Problem.objects.filter(id__lt=problem.pk).order_by("-id").first()

    return (
        next_problem.pk if next_problem else None,
        previous_problem.pk if previous_problem else None,
    )
