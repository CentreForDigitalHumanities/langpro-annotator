import json
from .models import Problem
from .types import FracasProblem, SickProblem


def get_sick_problems() -> list[SickProblem]:
    """
    Retrieves all Problem objects of type 'SICK' from the database
    and converts them into SickProblem instances.
    """
    sick_problems: list[SickProblem] = []
    problem_objects = Problem.objects.filter(type=Problem.ProblemType.SICK)

    for problem_obj in problem_objects:
        try:
            problem_data = json.loads(problem_obj.content)
            problem = SickProblem(
                    pair_id=problem_data["pair_ID"],
                    sentence_one=problem_data["sentence_A"],
                    sentence_two=problem_data["sentence_B"],
                    entailment_label=problem_data["entailment_label"],
                    relatedness_score=float(problem_data["relatedness_score"]),
                )
            sick_problems.append(problem)
        except json.JSONDecodeError:
            print(
                f"Warning: Could not parse JSON content for Problem ID {problem_obj.id}"
            )
        except TypeError as e:
            print(
                f"Warning: Could not create SickProblem for Problem ID {problem_obj.id}: {e}"
            )

    return sick_problems


def get_fracas_problems() -> list[FracasProblem]:
    """
    Retrieves all Problem objects of type 'Fracas' from the database
    and converts them into FracasProblem instances.
    """
    fracas_problems: list[FracasProblem] = []
    problem_objects = Problem.objects.filter(type=Problem.ProblemType.FRACAS)

    for problem_obj in problem_objects:
        try:
            problem_data = json.loads(problem_obj.content)
            problem = FracasProblem(
                fracas_id=problem_data["fracas_id"],
                question=problem_data["question"],
                hypothesis=problem_data["hypothesis"],
                answer=problem_data["answer"],
                fracas_answer=problem_data["fracas_answer"],
                fracas_non_standard=problem_data["fracas_non_standard"],
                note=problem_data["note"],
                section_name=problem_data["section_name"],
                subsection_name=problem_data["subsection_name"],
                premises=problem_data.get("premises", []),
            )
            fracas_problems.append(problem)
        except json.JSONDecodeError:
            print(
                f"Warning: Could not parse JSON content for Problem ID {problem_obj.id}"
            )
        except TypeError as e:
            print(
                f"Warning: Could not create FracasProblem for Problem ID {problem_obj.id}: {e}"
            )

    return fracas_problems
