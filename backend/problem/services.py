import json
from typing import Tuple
from langpro_annotator.logger import logger
from problem.models import Problem
from problem.types import CombinedProblem, FracasProblem, SickProblem


def instance_to_sick_problem(instance: Problem) -> SickProblem | None:
    """
    Converts a Problem instance to a SickProblem object.
    """
    try:
        content = json.loads(instance.content)
        return SickProblem(
            pair_id=content["pair_ID"],
            sentence_one=content["sentence_A"],
            sentence_two=content["sentence_B"],
            entailment_label=content["entailment_label"],
            relatedness_score=float(content["relatedness_score"]),
        )
    except json.JSONDecodeError as e:
        logger.warning(f"Could not decode JSON for Problem ID {instance.id}: {e}")
        return None
    except Exception as e:
        logger.warning(
            f"Could not convert Problem ID {instance.id} to SickProblem: {e}"
        )
        return None


def instance_to_fracas_problem(instance: Problem) -> FracasProblem | None:
    """
    Converts a Problem instance to a FracasProblem object.
    """
    try:
        content = json.loads(instance.content)
        return FracasProblem(
            fracas_id=content["fracas_id"],
            question=content["question"],
            hypothesis=content["hypothesis"],
            answer=content["answer"],
            fracas_answer=content["fracas_answer"],
            fracas_non_standard=content["fracas_non_standard"],
            note=content["note"],
            section_name=content["section_name"],
            subsection_name=content["subsection_name"],
            premises=content.get("premises", []),
        )
    except json.JSONDecodeError as e:
        logger.warning(f"Could not decode JSON for Problem ID {instance.id}: {e}")
        return None
    except (KeyError, TypeError) as e:
        logger.warning(
            f"Could not convert Problem ID {instance.id} to FracasProblem: {e}"
        )
        return None


def get_sick_problems() -> list[SickProblem]:
    """
    Retrieves all Problem objects of type 'SICK' from the database
    and converts them into SickProblem instances.
    """
    problems = Problem.objects.filter(type=Problem.ProblemType.SICK)
    return [
        converted
        for problem in problems
        if (converted := instance_to_sick_problem(problem)) is not None
    ]


def get_fracas_problems() -> list[FracasProblem]:
    """
    Retrieves all Problem objects of type 'Fracas' from the database
    and converts them into FracasProblem instances.
    """
    problems = Problem.objects.filter(type=Problem.ProblemType.FRACAS)
    return [
        converted
        for problem in problems
        if (converted := instance_to_fracas_problem(problem)) is not None
    ]


def convert_to_subtype(problem: Problem) -> CombinedProblem | None:
    """
    Converts a Django Problem model instance to a specific subtype (dataclass)
    based on its type.
    """
    if problem.type == Problem.ProblemType.SICK:
        return instance_to_sick_problem(problem)
    elif problem.type == Problem.ProblemType.FRACAS:
        return instance_to_fracas_problem(problem)
    else:
        return None


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
