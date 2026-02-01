import pytest
from rest_framework import status

from annotation.models import AnnotationSession, Label, LabelAnnotation


@pytest.fixture
def sample_label(db):
    """Creates a sample label for testing."""
    return Label.objects.create(
        text="Test Label",
        description="A test label for testing purposes.",
    )


@pytest.fixture
def another_label(db):
    """Creates another sample label for testing."""
    return Label.objects.create(
        text="Another Label",
        description="Another test label.",
    )


@pytest.fixture
def annotation_session_annotator(db, annotator):
    """Creates an annotation session for the annotator."""
    return AnnotationSession.objects.create(user=annotator)


@pytest.fixture
def annotation_session_master(db, master_annotator):
    """Creates an annotation session for the master annotator."""
    return AnnotationSession.objects.create(user=master_annotator)


@pytest.fixture
def label_annotation_by_annotator(db, sample_problem, sample_label, annotator, annotation_session_annotator):
    """Creates a label_annotation attached by an annotator."""
    return LabelAnnotation.objects.create(
        problem=sample_problem,
        label=sample_label,
        session=annotation_session_annotator,
        created_by=annotator,
    )


@pytest.fixture
def label_annotation_by_master(db, sample_problem, another_label, master_annotator, annotation_session_master):
    """Creates a label_annotation attached by a master annotator."""
    return LabelAnnotation.objects.create(
        problem=sample_problem,
        label=another_label,
        session=annotation_session_master,
        created_by=master_annotator,
    )


class TestLabelViewGetPermissions:
    """Tests for GET permissions on the Label endpoint."""

    def test_unauthenticated_user_can_list_labels(self, api_client, sample_label):
        """Unauthenticated users should be able to list labels."""
        response = api_client.get("/api/label/")
        assert response.status_code == status.HTTP_200_OK

    def test_visitor_can_list_labels(self, api_client, visitor, sample_label):
        """Visitors should be able to list labels."""
        api_client.force_authenticate(user=visitor)
        response = api_client.get("/api/label/")
        assert response.status_code == status.HTTP_200_OK

    def test_annotator_can_list_labels(self, api_client, annotator, sample_label):
        """Annotators should be able to list labels."""
        api_client.force_authenticate(user=annotator)
        response = api_client.get("/api/label/")
        assert response.status_code == status.HTTP_200_OK

    def test_master_annotator_can_list_labels(
        self, api_client, master_annotator, sample_label
    ):
        """Master annotators should be able to list labels."""
        api_client.force_authenticate(user=master_annotator)
        response = api_client.get("/api/label/")
        assert response.status_code == status.HTTP_200_OK

    def test_unauthenticated_user_can_retrieve_label(self, api_client, sample_label):
        """Unauthenticated users should be able to retrieve a single label."""
        response = api_client.get(f"/api/label/{sample_label.id}/")
        assert response.status_code == status.HTTP_200_OK

    def test_visitor_can_retrieve_label(self, api_client, visitor, sample_label):
        """Visitors should be able to retrieve a single label."""
        api_client.force_authenticate(user=visitor)
        response = api_client.get(f"/api/label/{sample_label.id}/")
        assert response.status_code == status.HTTP_200_OK


class TestSavelabel_annotationsPermissions:
    """Tests for POST permissions (saving label_annotations) on the Label endpoint."""

    def test_unauthenticated_user_cannot_save_label_annotations(
        self, api_client, sample_problem, sample_label
    ):
        """Unauthenticated users should not be able to save label_annotations."""
        data = {
            "problemId": sample_problem.id,
            "selectedLabels": [{"id": sample_label.id}],
        }
        response = api_client.post("/api/label/", data, format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_visitor_cannot_save_label_annotations(
        self, api_client, visitor, sample_problem, sample_label
    ):
        """Visitors should not be able to save label_annotations."""
        api_client.force_authenticate(user=visitor)
        data = {
            "problemId": sample_problem.id,
            "selectedLabels": [{"id": sample_label.id}],
        }
        response = api_client.post("/api/label/", data, format="json")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_annotator_can_save_label_annotations(
        self, api_client, annotator, sample_problem, sample_label
    ):
        """Annotators should be able to save label_annotations."""
        api_client.force_authenticate(user=annotator)
        data = {
            "problemId": sample_problem.id,
            "selectedLabels": [{"id": sample_label.id}],
        }
        response = api_client.post("/api/label/", data, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["ok"] is True

        # Verify label_annotation was created
        label_annotation = LabelAnnotation.objects.get(
            problem=sample_problem, label=sample_label
        )
        assert label_annotation.created_by == annotator

    def test_master_annotator_can_save_label_annotations(
        self, api_client, master_annotator, sample_problem, sample_label
    ):
        """Master annotators should be able to save label_annotations."""
        api_client.force_authenticate(user=master_annotator)
        data = {
            "problemId": sample_problem.id,
            "selectedLabels": [{"id": sample_label.id}],
        }
        response = api_client.post("/api/label/", data, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["ok"] is True


class TestRemoveLabelAnnotationPermissions:
    """Tests for label_annotation removal permissions."""

    def test_annotator_can_remove_own_label_annotation(
        self, api_client, annotator, sample_problem, label_annotation_by_annotator
    ):
        """Annotators should be able to remove labels they attached."""
        api_client.force_authenticate(user=annotator)
        data = {
            "problemId": sample_problem.id,
            "selectedLabels": [],  # Empty = remove the existing label
        }
        response = api_client.post("/api/label/", data, format="json")
        assert response.status_code == status.HTTP_200_OK

        # Verify label_annotation was marked as removed
        label_annotation_by_annotator.refresh_from_db()
        assert label_annotation_by_annotator.removed_at is not None
        assert label_annotation_by_annotator.removed_by == annotator

    def test_annotator_cannot_remove_others_label_annotation(
        self, api_client, annotator, sample_problem, label_annotation_by_master
    ):
        """Annotators should not be able to remove labels attached by others."""
        api_client.force_authenticate(user=annotator)
        data = {
            "problemId": sample_problem.id,
            "selectedLabels": [],  # Empty = try to remove the existing label
        }
        response = api_client.post("/api/label/", data, format="json")
        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert (
            "You can only remove labels you attached yourself"
            in response.data["detail"]
        )

        # Verify label_annotation was NOT removed
        label_annotation_by_master.refresh_from_db()
        assert label_annotation_by_master.removed_at is None

    def test_master_annotator_can_remove_own_label_annotation(
        self, api_client, master_annotator, sample_problem, label_annotation_by_master
    ):
        """Master annotators should be able to remove labels they attached."""
        api_client.force_authenticate(user=master_annotator)
        data = {
            "problemId": sample_problem.id,
            "selectedLabels": [],
        }
        response = api_client.post("/api/label/", data, format="json")
        assert response.status_code == status.HTTP_200_OK

        label_annotation_by_master.refresh_from_db()
        assert label_annotation_by_master.removed_at is not None

    def test_master_annotator_can_remove_others_label_annotation(
        self, api_client, master_annotator, sample_problem, label_annotation_by_annotator
    ):
        """Master annotators should be able to remove labels attached by others."""
        api_client.force_authenticate(user=master_annotator)
        data = {
            "problemId": sample_problem.id,
            "selectedLabels": [],
        }
        response = api_client.post("/api/label/", data, format="json")
        assert response.status_code == status.HTTP_200_OK

        label_annotation_by_annotator.refresh_from_db()
        assert label_annotation_by_annotator.removed_at is not None
        assert label_annotation_by_annotator.removed_by == master_annotator


class TestLabelAnnotationAddAndRemove:
    """Tests for adding / removing label_annotations."""

    def test_adding_label_creates_label_annotation(
        self, api_client, annotator, sample_problem, sample_label
    ):
        """Adding a label should create a new label_annotation record."""
        api_client.force_authenticate(user=annotator)
        data = {
            "problemId": sample_problem.id,
            "selectedLabels": [{"id": sample_label.id}],
        }
        response = api_client.post("/api/label/", data, format="json")
        assert response.status_code == status.HTTP_200_OK

        assert LabelAnnotation.objects.filter(
            problem=sample_problem, label=sample_label, removed_at__isnull=True
        ).exists()

    def test_adding_multiple_labels(
        self, api_client, annotator, sample_problem, sample_label, another_label
    ):
        """Should be able to add multiple labels at once."""
        api_client.force_authenticate(user=annotator)
        data = {
            "problemId": sample_problem.id,
            "selectedLabels": [{"id": sample_label.id}, {"id": another_label.id}],
        }
        response = api_client.post("/api/label/", data, format="json")
        assert response.status_code == status.HTTP_200_OK

        active_label_annotations = LabelAnnotation.objects.filter(
            problem=sample_problem, removed_at__isnull=True
        )
        assert active_label_annotations.count() == 2

    def test_keeping_existing_labels_unchanged(
        self,
        api_client,
        annotator,
        sample_problem,
        label_annotation_by_annotator,
        another_label,
    ):
        """Labels already attached should remain if still in selectedLabels."""
        original_label_annotation_id = label_annotation_by_annotator.id
        api_client.force_authenticate(user=annotator)
        data = {
            "problemId": sample_problem.id,
            "selectedLabels": [
                {"id": label_annotation_by_annotator.label.id},
                {"id": another_label.id},
            ],
        }
        response = api_client.post("/api/label/", data, format="json")
        assert response.status_code == status.HTTP_200_OK

        # Original label_annotation should still be active
        label_annotation_by_annotator.refresh_from_db()
        assert label_annotation_by_annotator.id == original_label_annotation_id
        assert label_annotation_by_annotator.removed_at is None

        # New label_annotation should be created
        assert LabelAnnotation.objects.filter(
            problem=sample_problem, label=another_label, removed_at__isnull=True
        ).exists()
