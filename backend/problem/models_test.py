import pytest

from annotation.models import KnowledgeBaseAnnotation, LabelAnnotation
from problem.models import Problem


@pytest.fixture
def kb_annotation(db, annotator_session, non_user_problem):
    return KnowledgeBaseAnnotation.objects.create(
        problem=non_user_problem,
        entity1="dog",
        entity2="canine",
        relationship=KnowledgeBaseAnnotation.Relationship.EQUAL,
        session=annotator_session,
        created_by=annotator_session.user,
    )

@pytest.mark.django_db
def test_status_bronze_no_annotations(db, non_user_problem):
    """
    A problem with no annotations and gold=False is bronze.

    This also functions as an initial assumption check for the tests below.
    """
    assert non_user_problem.status == Problem.Status.BRONZE


@pytest.mark.django_db
def test_status_gold_without_annotation(db, non_user_problem):
    """A problem with gold=True is gold without annotations."""
    non_user_problem.gold = True
    non_user_problem.save()
    assert non_user_problem.status == Problem.Status.GOLD

@pytest.mark.django_db
def test_status_gold_with_annotation(db, non_user_problem, kb_annotation):
    """A problem with gold=True is gold even with annotations."""
    non_user_problem.gold = True
    non_user_problem.save()
    assert non_user_problem.status == Problem.Status.GOLD


@pytest.mark.django_db
def test_status_silver_with_kb_annotation(db, non_user_problem, kb_annotation):
    """A problem with an active KB annotation and gold=False is silver."""
    assert non_user_problem.status == Problem.Status.SILVER

@pytest.mark.django_db
def test_status_silver_with_label_annotation(db, non_user_problem, annotator_session, sample_label):
    """A problem with an active label annotation and gold=False is silver."""
    LabelAnnotation.objects.create(
        problem=non_user_problem,
        label=sample_label,
        session=annotator_session,
        created_by=annotator_session.user,
    )
    assert non_user_problem.status == Problem.Status.SILVER


@pytest.mark.django_db
def test_status_bronze_when_all_annotations_removed(db, non_user_problem, annotator_session):
    """A problem whose only annotation is removed reverts to bronze."""
    from django.utils import timezone

    kb = KnowledgeBaseAnnotation.objects.create(
        problem=non_user_problem,
        entity1="dog",
        entity2="canine",
        relationship=KnowledgeBaseAnnotation.Relationship.EQUAL,
        session=annotator_session,
        created_by=annotator_session.user,
    )
    kb.removed_at = timezone.now()
    kb.removed_by = annotator_session.user
    kb.save()

    assert non_user_problem.status == Problem.Status.BRONZE


@pytest.mark.django_db
def test_status_serialized(db, non_user_problem):
    """The status field is correctly serialized."""
    from problem.serializers import ProblemSerializer

    serializer = ProblemSerializer(non_user_problem)
    assert serializer.data["status"] == Problem.Status.BRONZE
    assert serializer.data["gold"] is False
