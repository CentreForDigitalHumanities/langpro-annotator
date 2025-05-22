import json
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
        logger.warning(
            f"Could not decode JSON for Problem ID {instance.id}: {e}"
        )
        return None
    except (KeyError, TypeError) as e:
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
            fracas_id=instance.content["fracas_id"],
            question=instance.content["question"],
            hypothesis=instance.content["hypothesis"],
            answer=instance.content["answer"],
            fracas_answer=instance.content["fracas_answer"],
            fracas_non_standard=instance.content["fracas_non_standard"],
            note=instance.content["note"],
            section_name=instance.content["section_name"],
            subsection_name=instance.content["subsection_name"],
            premises=instance.content.get("premises", []),
        )
    except json.JSONDecodeError as e:
        logger.warning(
            f"Could not decode JSON for Problem ID {instance.id}: {e}"
        )
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

def get_problem_by_id(problem_id: int) -> CombinedProblem | None:
    """
    Retrieves a Problem object by its ID from the database.
    """
    try:
        problem = Problem.objects.get(id=problem_id)
    except Problem.DoesNotExist:
        return None

    if problem.type == Problem.ProblemType.SICK:
        return instance_to_sick_problem(problem)
    elif problem.type == Problem.ProblemType.FRACAS:
        return instance_to_fracas_problem(problem)
    else:
        return None


