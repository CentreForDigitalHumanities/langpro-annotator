import pytest
from rest_framework.exceptions import ValidationError

from .serializers import ProblemInputSerializer
from .models import Problem, Sentence, KnowledgeBase


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


@pytest.fixture
def kb_item(db, user_problem):
    return KnowledgeBase.objects.create(
        problem=user_problem,
        entity1="e1",
        entity2="e2",
        relationship=KnowledgeBase.Relationship.EQUAL,
    )


@pytest.mark.django_db
def test_valid_create_data():
    """Test valid data for creating a problem."""
    data = {
        "premises": ["A cat is running."],
        "hypothesis": "A cat is moving.",
        "kbItems": [],
    }
    serializer = ProblemInputSerializer(data=data)
    assert serializer.is_valid(raise_exception=True)


@pytest.mark.django_db
def test_valid_update_data(user_problem, kb_item):
    """Test valid data for updating a user problem."""
    data = {
        "id": user_problem.pk,
        "premises": ["The cat is on the mat."],
        "hypothesis": "A cat is on a mat.",
        "kbItems": [
            {
                "id": kb_item.pk,
                "entity1": "e1",
                "entity2": "e2",
                "relationship": "equal",
            },
            {"entity1": "new_e1", "entity2": "new_e2", "relationship": "subset"},
        ],
    }
    serializer = ProblemInputSerializer(data=data)
    assert serializer.is_valid(raise_exception=True)


@pytest.mark.django_db
def test_valid_create_data_no_id():
    """Test valid data for creating a problem without an ID."""
    data = {
        "premises": ["A dog barks."],
        "hypothesis": "A dog makes noise.",
        "kbItems": [],
    }
    serializer = ProblemInputSerializer(data=data)
    assert serializer.is_valid(raise_exception=True)


@pytest.mark.django_db
def test_invalid_id_non_existent():
    """Test that a non-existent problem ID is invalid."""
    data = {
        "id": 9999,
        "premises": ["premise"],
        "hypothesis": "hypothesis",
        "kbItems": [],
    }
    serializer = ProblemInputSerializer(data=data)
    with pytest.raises(ValidationError) as exc_info:
        serializer.is_valid(raise_exception=True)
    assert "does not exist" in str(exc_info.value)


@pytest.mark.django_db
def test_invalid_id_not_user_problem(non_user_problem):
    """Test that a non-user problem ID is invalid."""
    data = {
        "id": non_user_problem.pk,
        "premises": ["premise"],
        "hypothesis": "hypothesis",
        "kbItems": [],
    }
    serializer = ProblemInputSerializer(data=data)
    with pytest.raises(ValidationError) as exc_info:
        serializer.is_valid(raise_exception=True)
    assert "does not exist" in str(exc_info.value)


@pytest.mark.django_db
def test_empty_premises_invalid():
    """Test that an empty list of premises is invalid."""
    data = {"premises": [], "hypothesis": "hypothesis", "kbItems": []}
    serializer = ProblemInputSerializer(data=data)
    assert not serializer.is_valid()
    assert "premises" in serializer.errors


@pytest.mark.django_db
def test_blank_premise_invalid():
    """Test that a blank premise string is invalid."""
    data = {"premises": [""], "hypothesis": "hypothesis", "kbItems": []}
    serializer = ProblemInputSerializer(data=data)
    assert not serializer.is_valid()
    assert "premises" in serializer.errors


@pytest.mark.django_db
def test_blank_hypothesis_invalid():
    """Test that a blank hypothesis is invalid."""
    data = {"premises": ["premise"], "hypothesis": "", "kbItems": []}
    serializer = ProblemInputSerializer(data=data)
    assert not serializer.is_valid()
    assert "hypothesis" in serializer.errors


@pytest.mark.django_db
def test_invalid_kb_item_id():
    """Test that a non-existent kbItem ID is invalid."""
    data = {
        "premises": ["premise"],
        "hypothesis": "hypothesis",
        "kbItems": [{"id": 9999, "relationship": "equal"}],
    }
    serializer = ProblemInputSerializer(data=data)
    assert not serializer.is_valid()
    assert "kbItems" in serializer.errors


@pytest.mark.django_db
def test_kb_item_missing_relationship():
    """Test that a kbItem missing a relationship is invalid."""
    data = {
        "premises": ["premise"],
        "hypothesis": "hypothesis",
        "kbItems": [{"entity1": "e1", "entity2": "e2"}],
    }
    serializer = ProblemInputSerializer(data=data)
    assert not serializer.is_valid()
    assert "kbItems" in serializer.errors
