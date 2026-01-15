import pytest
from rest_framework import status

from annotation.models import Label, Labeling


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
def labeling_by_annotator(db, sample_problem, sample_label, annotator):
    """Creates a labeling attached by an annotator."""
    return Labeling.objects.create(
        problem=sample_problem,
        label=sample_label,
        attached_by=annotator,
    )


@pytest.fixture
def labeling_by_master(db, sample_problem, another_label, master_annotator):
    """Creates a labeling attached by a master annotator."""
    return Labeling.objects.create(
        problem=sample_problem,
        label=another_label,
        attached_by=master_annotator,
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


class TestSaveLabelingsPermissions:
    """Tests for POST permissions (saving labelings) on the Label endpoint."""

    def test_unauthenticated_user_cannot_save_labelings(
        self, api_client, sample_problem, sample_label
    ):
        """Unauthenticated users should not be able to save labelings."""
        data = {
            "problemId": sample_problem.id,
            "selectedLabels": [{"id": sample_label.id}],
            "remarks": "",
        }
        response = api_client.post("/api/label/", data, format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_visitor_cannot_save_labelings(
        self, api_client, visitor, sample_problem, sample_label
    ):
        """Visitors should not be able to save labelings."""
        api_client.force_authenticate(user=visitor)
        data = {
            "problemId": sample_problem.id,
            "selectedLabels": [{"id": sample_label.id}],
            "remarks": "",
        }
        response = api_client.post("/api/label/", data, format="json")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_annotator_can_save_labelings(
        self, api_client, annotator, sample_problem, sample_label
    ):
        """Annotators should be able to save labelings."""
        api_client.force_authenticate(user=annotator)
        data = {
            "problemId": sample_problem.id,
            "selectedLabels": [{"id": sample_label.id}],
            "remarks": "Test remark",
        }
        response = api_client.post("/api/label/", data, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["ok"] is True

        # Verify labeling was created
        labeling = Labeling.objects.get(problem=sample_problem, label=sample_label)
        assert labeling.attached_by == annotator
        assert labeling.notes == "Test remark"

    def test_master_annotator_can_save_labelings(
        self, api_client, master_annotator, sample_problem, sample_label
    ):
        """Master annotators should be able to save labelings."""
        api_client.force_authenticate(user=master_annotator)
        data = {
            "problemId": sample_problem.id,
            "selectedLabels": [{"id": sample_label.id}],
            "remarks": "",
        }
        response = api_client.post("/api/label/", data, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["ok"] is True


class TestRemoveLabelingPermissions:
    """Tests for labeling removal permissions."""

    def test_annotator_can_remove_own_labeling(
        self, api_client, annotator, sample_problem, labeling_by_annotator
    ):
        """Annotators should be able to remove labels they attached."""
        api_client.force_authenticate(user=annotator)
        data = {
            "problemId": sample_problem.id,
            "selectedLabels": [],  # Empty = remove the existing label
            "remarks": "Removing my own label",
        }
        response = api_client.post("/api/label/", data, format="json")
        assert response.status_code == status.HTTP_200_OK

        # Verify labeling was marked as removed
        labeling_by_annotator.refresh_from_db()
        assert labeling_by_annotator.removed_at is not None
        assert labeling_by_annotator.removed_by == annotator

    def test_annotator_cannot_remove_others_labeling(
        self, api_client, annotator, sample_problem, labeling_by_master
    ):
        """Annotators should not be able to remove labels attached by others."""
        api_client.force_authenticate(user=annotator)
        data = {
            "problemId": sample_problem.id,
            "selectedLabels": [],  # Empty = try to remove the existing label
            "remarks": "",
        }
        response = api_client.post("/api/label/", data, format="json")
        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert (
            "You can only remove labels you attached yourself" in response.data["detail"]
        )

        # Verify labeling was NOT removed
        labeling_by_master.refresh_from_db()
        assert labeling_by_master.removed_at is None

    def test_master_annotator_can_remove_own_labeling(
        self, api_client, master_annotator, sample_problem, labeling_by_master
    ):
        """Master annotators should be able to remove labels they attached."""
        api_client.force_authenticate(user=master_annotator)
        data = {
            "problemId": sample_problem.id,
            "selectedLabels": [],
            "remarks": "",
        }
        response = api_client.post("/api/label/", data, format="json")
        assert response.status_code == status.HTTP_200_OK

        labeling_by_master.refresh_from_db()
        assert labeling_by_master.removed_at is not None

    def test_master_annotator_can_remove_others_labeling(
        self, api_client, master_annotator, sample_problem, labeling_by_annotator
    ):
        """Master annotators should be able to remove labels attached by others."""
        api_client.force_authenticate(user=master_annotator)
        data = {
            "problemId": sample_problem.id,
            "selectedLabels": [],
            "remarks": "Removing annotator's label",
        }
        response = api_client.post("/api/label/", data, format="json")
        assert response.status_code == status.HTTP_200_OK

        labeling_by_annotator.refresh_from_db()
        assert labeling_by_annotator.removed_at is not None
        assert labeling_by_annotator.removed_by == master_annotator


class TestLabelingAddAndRemove:
    """Tests for adding / removing labelings."""

    def test_adding_label_creates_labeling(
        self, api_client, annotator, sample_problem, sample_label
    ):
        """Adding a label should create a new Labeling record."""
        api_client.force_authenticate(user=annotator)
        data = {
            "problemId": sample_problem.id,
            "selectedLabels": [{"id": sample_label.id}],
            "remarks": "",
        }
        response = api_client.post("/api/label/", data, format="json")
        assert response.status_code == status.HTTP_200_OK

        assert Labeling.objects.filter(
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
            "remarks": "",
        }
        response = api_client.post("/api/label/", data, format="json")
        assert response.status_code == status.HTTP_200_OK

        active_labelings = Labeling.objects.filter(
            problem=sample_problem, removed_at__isnull=True
        )
        assert active_labelings.count() == 2

    def test_keeping_existing_labels_unchanged(
        self,
        api_client,
        annotator,
        sample_problem,
        labeling_by_annotator,
        another_label,
    ):
        """Labels already attached should remain if still in selectedLabels."""
        original_labeling_id = labeling_by_annotator.id
        api_client.force_authenticate(user=annotator)
        data = {
            "problemId": sample_problem.id,
            "selectedLabels": [
                {"id": labeling_by_annotator.label.id},
                {"id": another_label.id},
            ],
            "remarks": "",
        }
        response = api_client.post("/api/label/", data, format="json")
        assert response.status_code == status.HTTP_200_OK

        # Original labeling should still be active
        labeling_by_annotator.refresh_from_db()
        assert labeling_by_annotator.id == original_labeling_id
        assert labeling_by_annotator.removed_at is None

        # New labeling should be created
        assert Labeling.objects.filter(
            problem=sample_problem, label=another_label, removed_at__isnull=True
        ).exists()
