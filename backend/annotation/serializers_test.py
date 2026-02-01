import pytest
from typing import Any

from django.utils import timezone
from django.contrib.auth.models import Permission
from rest_framework.test import APIRequestFactory

from annotation.models import KnowledgeBaseAnnotation, Label, LabelAnnotation
from annotation.serializers import (
    KnowledgeBaseAnnotationSerializer,
    LabelSerializer,
    LabelAnnotationSerializer,
    AnnotationSerializer,
    SaveLabelsInputSerializer,
)


@pytest.fixture
def kb_annotation(db, sample_problem, annotation_session):
    return KnowledgeBaseAnnotation.objects.create(
        problem=sample_problem,
        entity1="e1",
        entity2="e2",
        relationship=KnowledgeBaseAnnotation.Relationship.EQUAL,
        session=annotation_session,
        created_at="2024-01-01T00:00:00Z",
        created_by=annotation_session.user,
    )


@pytest.fixture
def sample_label(db):
    """Create a sample label for testing."""
    return Label.objects.create(
        text="Ambiguous", description="This problem contains ambiguous language."
    )


@pytest.fixture
def label_annotation(db, sample_problem, annotation_session, sample_label):
    """Create a label annotation for testing."""
    return LabelAnnotation.objects.create(
        problem=sample_problem,
        label=sample_label,
        session=annotation_session,
        created_by=annotation_session.user,
    )


@pytest.mark.django_db
def test_invalid_kb_item_id(annotation_session, sample_problem):
    """Test that a non-existent kbItem ID is invalid."""
    data = {
        "id": 9999,
        "relationship": "equal",
        "entity1": "e1",
        "entity2": "e2",
        "session": annotation_session.pk,
        "problem": sample_problem.pk,
    }
    serializer = KnowledgeBaseAnnotationSerializer(data=data)
    assert not serializer.is_valid()
    assert "id" in serializer.errors


@pytest.mark.django_db
def test_kb_item_missing_relationship(kb_annotation):
    """Test that a kbItem missing a relationship is invalid."""
    data = {"id": kb_annotation.pk, "entity1": "e1", "entity2": "e2"}
    serializer = KnowledgeBaseAnnotationSerializer(data=data)
    assert not serializer.is_valid()
    assert "relationship" in serializer.errors


@pytest.mark.django_db
def test_valid_kb_annotation_data(annotation_session, sample_problem):
    """Test that valid KB annotation data is accepted."""
    data = {
        "relationship": "equal",
        "entity1": "cat",
        "entity2": "feline",
        "session": annotation_session.pk,
        "problem": sample_problem.pk,
    }
    serializer = KnowledgeBaseAnnotationSerializer(data=data)
    assert serializer.is_valid(), serializer.errors


@pytest.mark.django_db
def test_kb_annotation_serialization(kb_annotation):
    """Test serializing an existing KB annotation."""
    factory = APIRequestFactory()
    request = factory.get("/")
    request.user = kb_annotation.created_by

    serializer = KnowledgeBaseAnnotationSerializer(
        kb_annotation, context={"request": request}
    )
    data: dict[str, Any] = serializer.data  # type: ignore

    assert data["id"] == kb_annotation.pk
    assert data["entity1"] == "e1"
    assert data["entity2"] == "e2"
    assert data["relationship"] == "equal"
    assert "createdAt" in data
    assert "createdBy" in data


@pytest.mark.django_db
def test_kb_annotation_update(kb_annotation):
    """Test updating an existing KB annotation."""
    serializer = KnowledgeBaseAnnotationSerializer(kb_annotation)
    updated_data = {
        "entity1": "updated_e1",
        "entity2": "updated_e2",
        "relationship": "subset",
    }

    updated = serializer.update(kb_annotation, updated_data)

    assert updated.entity1 == updated_data["entity1"]
    assert updated.entity2 == updated_data["entity2"]
    assert updated.relationship == updated_data["relationship"]


@pytest.mark.django_db
def test_kb_annotation_get_removable_with_permission(kb_annotation, annotator):
    """Test that get_removable returns True when user has permission."""
    permission = Permission.objects.get(
        codename="delete_knowledgebaseannotation",
        content_type__app_label="annotation"
    )
    annotator.user_permissions.add(permission)
    annotator.refresh_from_db()

    factory = APIRequestFactory()
    request = factory.get("/")
    request.user = annotator

    serializer = KnowledgeBaseAnnotationSerializer(
        kb_annotation, context={"request": request}
    )
    data: dict[str, Any] = serializer.data  # type: ignore
    assert data["removable"] is True


@pytest.mark.django_db
def test_kb_annotation_get_removable_without_permission(kb_annotation, visitor):
    """Test that get_removable returns False when user lacks permission."""
    factory = APIRequestFactory()
    request = factory.get("/")
    request.user = visitor

    serializer = KnowledgeBaseAnnotationSerializer(
        kb_annotation, context={"request": request}
    )
    data: dict[str, Any] = serializer.data  # type: ignore
    assert data["removable"] is False


@pytest.mark.django_db
def test_label_serialization(sample_label):
    """Test serializing a label."""
    serializer = LabelSerializer(sample_label)
    data: dict[str, Any] = serializer.data  # type: ignore

    assert data["id"] == sample_label.pk
    assert data["text"] == sample_label.text
    assert data["description"] == sample_label.description


@pytest.mark.django_db
def test_label_annotation_serialization(label_annotation):
    """Test serializing a label annotation."""
    serializer = LabelAnnotationSerializer(
        label_annotation, context={"user": label_annotation.created_by}
    )
    data: dict[str, Any] = serializer.data  # type: ignore

    assert data["id"] == label_annotation.pk
    assert data["label"]["text"] == label_annotation.label.text
    assert data["attachedByCurrentUser"] is True


@pytest.mark.django_db
def test_label_annotation_attached_by_different_user(label_annotation, visitor):
    """Test attachedByCurrentUser is False for different user."""
    serializer = LabelAnnotationSerializer(label_annotation, context={"user": visitor})
    data: dict[str, Any] = serializer.data  # type: ignore

    assert data["attachedByCurrentUser"] is False


@pytest.mark.django_db
def test_label_annotation_removable_by_creator(label_annotation, annotator):
    """Test that creator can remove their own annotation with proper permission."""
    perm = Permission.objects.get(codename="delete_own_labelannotation")
    annotator.user_permissions.add(perm)

    serializer = LabelAnnotationSerializer(
        label_annotation, context={"user": annotator}
    )
    data: dict[str, Any] = serializer.data  # type: ignore
    assert data["removable"] is True


@pytest.mark.django_db
def test_label_annotation_removable_by_master(label_annotation, master_annotator):
    """Test that master annotator can remove any annotation."""
    serializer = LabelAnnotationSerializer(
        label_annotation, context={"user": master_annotator}
    )
    data: dict[str, Any] = serializer.data  # type: ignore
    assert data["removable"] is True


@pytest.mark.django_db
def test_label_annotation_not_removable_without_permission(label_annotation, visitor):
    """Test that user without permission cannot remove annotation."""
    serializer = LabelAnnotationSerializer(label_annotation, context={"user": visitor})
    data: dict[str, Any] = serializer.data  # type: ignore
    assert data["removable"] is False


@pytest.mark.django_db
def test_annotation_serializer_with_kb_and_labels(
    sample_problem, annotation_session, kb_annotation, label_annotation
):
    """Test AnnotationSerializer returns both KB and label annotations."""
    serializer = AnnotationSerializer(
        {},
        context={
            "problem": sample_problem,
            "user": annotation_session.user,
        },
    )
    data: dict[str, Any] = serializer.data  # type: ignore

    assert "kbAnnotations" in data
    assert "labelAnnotations" in data
    assert len(data["kbAnnotations"]) > 0
    assert len(data["labelAnnotations"]) > 0


@pytest.mark.django_db
def test_annotation_serializer_excludes_removed_annotations(
    sample_problem, annotation_session, kb_annotation
):
    """Test that removed annotations are not included."""

    kb_annotation.removed_at = timezone.now()
    kb_annotation.removed_by = annotation_session.user
    kb_annotation.save()

    serializer = AnnotationSerializer(
        {},
        context={
            "problem": sample_problem,
            "user": annotation_session.user,
        },
    )
    data: dict[str, Any] = serializer.data  # type: ignore

    assert len(data["kbAnnotations"]) == 0


@pytest.mark.django_db
def test_save_labels_input_valid(sample_problem, sample_label):
    """Test valid save labels input data."""
    data = {
        "problemId": sample_problem.pk,
        "selectedLabels": [{"id": sample_label.pk}],
    }
    serializer = SaveLabelsInputSerializer(data=data)
    assert serializer.is_valid(), serializer.errors


@pytest.mark.django_db
def test_save_labels_input_empty_labels(sample_problem):
    """Test save labels input with empty label list."""
    data = {
        "problemId": sample_problem.pk,
        "selectedLabels": [],
    }
    serializer = SaveLabelsInputSerializer(data=data)
    assert serializer.is_valid()


@pytest.mark.django_db
def test_save_labels_input_invalid_problem():
    """Test that non-existent problem ID is invalid."""
    data = {
        "problemId": 9999,
        "selectedLabels": [],
    }
    serializer = SaveLabelsInputSerializer(data=data)
    assert not serializer.is_valid()
    assert "problemId" in serializer.errors
