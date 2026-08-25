import pytest

from problem.models import Problem, Sentence


@pytest.fixture
def hypothesis_sentence(db):
    return Sentence.objects.create(text="Hypothesis")


@pytest.fixture
def premise_sentence(db):
    return Sentence.objects.create(text="Premise")


@pytest.fixture
def user_problem(db, hypothesis_sentence, premise_sentence):
    problem = Problem.objects.create(
        dataset=Problem.Dataset.USER,
        hypothesis=hypothesis_sentence,
        extra_data={},
    )
    problem.premises.add(premise_sentence)
    return problem


@pytest.fixture
def non_user_problem(db, hypothesis_sentence, premise_sentence):
    problem = Problem.objects.create(
        dataset=Problem.Dataset.SICK,
        hypothesis=hypothesis_sentence,
        extra_data={},
    )
    problem.premises.add(premise_sentence)
    return problem
