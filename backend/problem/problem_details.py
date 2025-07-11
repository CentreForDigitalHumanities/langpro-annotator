from typing import Tuple
from langpro_annotator.logger import logger
from problem.models import Problem


def get_related_problem_ids(problem_id: int) -> Tuple[int, int, int]:
    """
    Retrieves the IDs of the next, previous, and random Problem objects
    in the database relative to the given problem ID.
    """

    try:
        problem = Problem.objects.get(id=problem_id)
    except Problem.DoesNotExist:
        logger.warning(f"Problem ID {problem_id} does not exist.")
        return None, None, None

    next_problem = Problem.objects.filter(id__gt=problem.id).order_by("id").first()
    previous_problem = Problem.objects.filter(id__lt=problem.id).order_by("-id").first()
    random_problem = Problem.objects.exclude(id=problem.id).order_by("?").first()

    return (
        next_problem.id if next_problem else None,
        previous_problem.id if previous_problem else None,
        random_problem.id if random_problem else None,
    )
