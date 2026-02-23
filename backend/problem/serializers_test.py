import pytest
from rest_framework.exceptions import ValidationError

from annotation.models import KnowledgeBaseAnnotation
from problem.serializers_test_utils import input_serializer_with_user
from .serializers import ProblemInputSerializer
from .models import Problem, Sentence

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
def test_valid_update_data(user_problem):
    """Test valid data for updating a user problem."""
    data = {
        "id": user_problem.pk,
        "premises": ["The cat is on the mat."],
        "hypothesis": "A cat is on a mat.",
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
def test_kb_create_no_permission(user_problem, visitor):
    """Test that KB annotations cannot be created without permission."""
    kb_input = [
        {
            "entity1": "cat",
            "entity2": "feline",
            "relationship": "equal",
            "notes": "Test note",
        }
    ]

    serializer = input_serializer_with_user(visitor)
    serializer._handle_kb_annotations(user_problem, kb_input) # type: ignore

    assert KnowledgeBaseAnnotation.objects.filter(problem=user_problem).count() == 0, "No KB annotations should be created without permission."


@pytest.mark.django_db
def test_kb_update_no_permission(user_problem, kb_annotation, visitor):
    """Test that KB annotations cannot be updated without permission."""
    kb_annotation.problem = user_problem
    kb_annotation.save()
    original_entity1 = kb_annotation.entity1

    kb_input = [
        {
            "id": kb_annotation.pk,
            "entity1": "updated_cat",
            "entity2": kb_annotation.entity2,
            "relationship": kb_annotation.relationship,
        }
    ]

    serializer = input_serializer_with_user(visitor)
    serializer._handle_kb_annotations(user_problem, kb_input) # type: ignore

    # Verify KB annotation was not updated
    kb_annotation.refresh_from_db()
    assert kb_annotation.entity1 == original_entity1, "KB annotation should not have been modified without permission."


@pytest.mark.django_db
def test_kb_mark_removed_no_permission(user_problem, kb_annotation, visitor):
    """Test that KB annotations cannot be marked as removed without permission."""
    kb_annotation.problem = user_problem
    kb_annotation.save()

    kb_input = []  # Empty list should mark any existing KB items as removed.

    serializer = input_serializer_with_user(visitor)
    serializer._handle_kb_annotations(user_problem, kb_input) # type: ignore

    # Verify KB annotation was not removed
    kb_annotation.refresh_from_db()
    assert kb_annotation.removed_at is None, "KB annotation should not have been marked as removed without permission."

@pytest.mark.django_db
def test_create_single_kb_annotation(user_problem, annotator):
    """Test creating a single KB annotation for a problem."""
    kb_input = [
        {
            "entity1": "dog",
            "entity2": "canine",
            "relationship": "equal",
            "notes": "Test note",
        }
    ]

    serializer = input_serializer_with_user(annotator)
    serializer._handle_kb_annotations(user_problem, kb_input)

    kb_annotations = KnowledgeBaseAnnotation.objects.filter(
        problem=user_problem, removed_at__isnull=True
    )
    assert kb_annotations.count() == 1, "One KB annotation should have been created."

    kb = kb_annotations.first()
    assert kb is not None
    assert kb.entity1 == "dog"
    assert kb.entity2 == "canine"
    assert kb.relationship == "equal"
    assert kb.notes == "Test note"
    assert kb.created_by == annotator


@pytest.mark.django_db
def test_update_single_kb_annotation(user_problem, kb_annotation, annotator):
    """Test updating a single KB annotation for a problem."""
    kb_annotation.problem = user_problem
    kb_annotation.save()

    kb_input = [
        {
            "id": kb_annotation.pk,
            "entity1": "updated_entity1",
            "entity2": "updated_entity2",
            "relationship": "subset",
            "notes": "Updated note",
        }
    ]

    serializer = input_serializer_with_user(annotator)
    serializer._handle_kb_annotations(user_problem, kb_input)

    # Verify KB annotation was updated
    kb_annotation.refresh_from_db()
    assert kb_annotation.entity1 == "updated_entity1"
    assert kb_annotation.entity2 == "updated_entity2"
    assert kb_annotation.relationship == "subset"
    assert kb_annotation.notes == "Updated note"
    assert kb_annotation.removed_at is None


@pytest.mark.django_db
def test_mark_kb_annotation_as_removed(user_problem, kb_annotation, annotator):
    """Test marking a KB annotation as removed for a problem."""
    kb_annotation.problem = user_problem
    kb_annotation.save()

    kb_input = []  # Empty list should mark existing as removed

    serializer = input_serializer_with_user(annotator)
    serializer._handle_kb_annotations(user_problem, kb_input)

    # Verify KB annotation was marked as removed
    kb_annotation.refresh_from_db()
    assert kb_annotation.removed_at is not None
    assert kb_annotation.removed_by == annotator


@pytest.mark.django_db
def test_create_and_update_multiple_kb_annotations(
    user_problem, kb_annotation, annotator
):
    """Test creating and updating multiple KB annotations for a problem."""
    kb_annotation.problem = user_problem
    kb_annotation.save()

    kb_input = [
        {
            "id": kb_annotation.pk,
            "entity1": "updated_e1",
            "entity2": "updated_e2",
            "relationship": "not_equal",
        },
        {
            "entity1": "new_e1",
            "entity2": "new_e2",
            "relationship": "subset",
        },
        {
            "entity1": "another_e1",
            "entity2": "another_e2",
            "relationship": "superset",
        },
    ]

    serializer = input_serializer_with_user(annotator)
    serializer._handle_kb_annotations(user_problem, kb_input)

    kb_annotations = KnowledgeBaseAnnotation.objects.filter(
        problem=user_problem, removed_at__isnull=True
    )
    assert kb_annotations.count() == 3, "There should be three new active KB annotations after update."

    # Verify the updated annotation
    kb_annotation.refresh_from_db()
    assert kb_annotation.entity1 == "updated_e1"
    assert kb_annotation.entity2 == "updated_e2"
    assert kb_annotation.relationship == "not_equal"

    # Verify the new annotations
    new_annotations = kb_annotations.exclude(id=kb_annotation.pk)
    assert new_annotations.count() == 2, "There should be two new KB annotations after update."

    entities = [(kb.entity1, kb.entity2) for kb in new_annotations]
    assert ("new_e1", "new_e2") in entities
    assert ("another_e1", "another_e2") in entities


@pytest.mark.django_db
def test_create_update_and_remove_kb_annotations(
    user_problem, annotator, annotator_session
):
    """Test creating, updating and removing multiple KB annotations for a problem."""
    # Create initial KB annotations
    kb1 = KnowledgeBaseAnnotation.objects.create(
        problem=user_problem,
        entity1="keep_e1",
        entity2="keep_e2",
        relationship="equal",
        session=annotator_session,
        created_by=annotator,
    )

    kb2 = KnowledgeBaseAnnotation.objects.create(
        problem=user_problem,
        entity1="remove_e1",
        entity2="remove_e2",
        relationship="equal",
        session=annotator_session,
        created_by=annotator,
    )

    # request = Mock(user=annotator)
    kb_input = [
        {
            "id": kb1.pk,
            "entity1": "updated_keep_e1",
            "entity2": "updated_keep_e2",
            "relationship": "subset",
        },
        {
            "entity1": "new_e1",
            "entity2": "new_e2",
            "relationship": "superset",
        },
    ]

    serializer = input_serializer_with_user(annotator)
    serializer._handle_kb_annotations(user_problem, kb_input)

    # Verify kb1 was updated.
    kb1.refresh_from_db()
    assert kb1.entity1 == "updated_keep_e1"
    assert kb1.entity2 == "updated_keep_e2"
    assert kb1.relationship == "subset"
    assert kb1.removed_at is None

    # Verify kb2 was marked as removed.
    kb2.refresh_from_db()
    assert kb2.removed_at is not None
    assert kb2.removed_by == annotator

    # Verify new annotation was created.
    active_annotations = KnowledgeBaseAnnotation.objects.filter(
        problem=user_problem, removed_at__isnull=True
    )
    assert active_annotations.count() == 2

    new_annotation = active_annotations.exclude(id=kb1.pk).first()
    assert new_annotation is not None
    assert new_annotation.entity1 == "new_e1"
    assert new_annotation.entity2 == "new_e2"
    assert new_annotation.relationship == "superset"
