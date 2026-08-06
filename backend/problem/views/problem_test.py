import pytest
from rest_framework import status

from problem.models import Problem


@pytest.fixture
def problem_input_data():
    """Returns valid input data for creating/updating a problem."""
    return {
        "premises": ["Test premise 1", "Test premise 2"],
        "hypothesis": "Test hypothesis",
        "entailmentLabel": "neutral",
        "kbItems": [
            {
                "entity1": "dog",
                "entity2": "canine",
                "relationship": "equal",
                "notes": "Test note",
            }
        ],
    }


class TestProblemViewPermissions:
    """
    Tests for problem view permissions as documented in the README.
    """

    # Retrieve / browse single

    def test_unauthenticated_user_can_retrieve_problem(self, client, sample_problem):
        """Unauthenticated users should be able to view a single problem."""
        response = client.get(f"/api/problem/{sample_problem.id}/")
        assert response.status_code == status.HTTP_200_OK

    def test_visitor_can_retrieve_problem(self, client, visitor, sample_problem):
        """Visitors should be able to view a single problem."""
        client.force_login(user=visitor)
        response = client.get(f"/api/problem/{sample_problem.id}/")
        assert response.status_code == status.HTTP_200_OK

    def test_annotator_can_retrieve_problem(self, client, annotator, sample_problem):
        """Annotators should be able to view a single problem."""
        client.force_login(user=annotator)
        response = client.get(f"/api/problem/{sample_problem.id}/")
        assert response.status_code == status.HTTP_200_OK

    def test_master_annotator_can_retrieve_problem(
        self, client, master_annotator, sample_problem
    ):
        """Master annotators should be able to view a single problem."""
        client.force_login(user=master_annotator)
        response = client.get(f"/api/problem/{sample_problem.id}/")
        assert response.status_code == status.HTTP_200_OK

    # Retrieve hidden problems

    def test_user_without_permission_cannot_see_hidden_problem(
        self, client, annotator, hidden_problem, sample_problem
    ):
        """Unauthenticated users should not be able to see hidden problems."""
        client.force_login(user=annotator)
        response = client.get(f"/api/problem/{hidden_problem.id}/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data['problem']['id'] == sample_problem.id, "Unauthenticated users requesting a hidden problem should receive the first non-hidden problem instead."

    def test_visitor_cannot_see_hidden_problem(self, client, visitor, hidden_problem, sample_problem):
        """Visitors should not be able to see hidden problems."""
        client.force_login(user=visitor)
        response = client.get(f"/api/problem/{hidden_problem.id}/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data['problem']['id'] == sample_problem.id, "Visitors requesting a hidden problem should receive the first non-hidden problem instead."

    def test_annotator_cannot_see_hidden_problem(
        self, client, annotator, hidden_problem, sample_problem
    ):
        """Annotators should not be able to see hidden problems."""
        client.force_login(user=annotator)
        response = client.get(f"/api/problem/{hidden_problem.id}/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data['problem']['id'] == sample_problem.id, "Annotators requesting a hidden problem should receive the first non-hidden problem instead."

    def test_master_annotator_can_see_hidden_problem(
        self, client, master_annotator, hidden_problem
    ):
        """Master annotators should be able to see hidden problems."""
        client.force_login(user=master_annotator)
        response = client.get(f"/api/problem/{hidden_problem.id}/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data['problem']['id'] == hidden_problem.id, "Master annotators requesting a hidden problem should receive that hidden problem."

    # Create

    def test_unauthenticated_user_cannot_create_problem(
        self, client, problem_input_data
    ):
        """Unauthenticated users should not be able to create problems."""
        response = client.post(
            "/api/problem/",
            problem_input_data,
            content_type="application/json",
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_visitor_cannot_create_problem(self, client, visitor, problem_input_data):
        """Visitors should not be able to create problems."""
        client.force_login(user=visitor)
        response = client.post(
            "/api/problem/",
            problem_input_data,
            content_type="application/json",
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_annotator_cannot_create_problem(
        self, client, annotator, problem_input_data
    ):
        """Annotators should not be able to create problems."""
        client.force_login(user=annotator)
        response = client.post(
            "/api/problem/",
            problem_input_data,
            content_type="application/json",
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_master_annotator_can_create_problem(
        self, client, master_annotator, problem_input_data
    ):
        """Master annotators should be able to create problems."""
        client.force_login(user=master_annotator)
        response = client.post(
            "/api/problem/",
            problem_input_data,
            content_type="application/json",
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert "id" in response.json()

    # Update core problem fields (hypothesis, premises, base)

    def test_unauthenticated_user_cannot_update_problem(
        self, client, sample_problem, problem_input_data
    ):
        """Unauthenticated users should not be able to update core problem fields."""
        response = client.patch(
            f"/api/problem/{sample_problem.id}/",
            problem_input_data,
            content_type="application/json",
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_visitor_cannot_update_problem(
        self, client, visitor, sample_problem, problem_input_data
    ):
        """Visitors should not be able to update core problem fields."""
        client.force_login(user=visitor)
        response = client.patch(
            f"/api/problem/{sample_problem.id}/",
            problem_input_data,
            content_type="application/json",
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_annotators_cannot_update_problem(
        self, client, annotator, sample_problem, problem_input_data
    ):
        """Annotators should not be able to update core problem fields."""

        # Make sure the update would change something.
        old_hypothesis = sample_problem.hypothesis.text
        old_premise = sample_problem.premises.first().text
        assert old_hypothesis != problem_input_data["hypothesis"]
        assert old_premise != problem_input_data["premises"][0]

        client.force_login(user=annotator)
        response = client.patch(
            f"/api/problem/{sample_problem.id}/",
            problem_input_data,
            content_type="application/json",
        )

        # The user is not authorized to update core problem fields, so one
        # might expect a 403 FORBIDDEN. However, annotator users /are/ allowed
        # to update KB annotations in the same view, so the request is not
        # entirely forbidden, resulting in a 200 OK status code.
        assert response.status_code == status.HTTP_200_OK

        sample_problem.refresh_from_db()
        assert sample_problem.hypothesis.text == old_hypothesis
        assert sample_problem.premises.first().text == old_premise

    def test_master_annotator_can_update_user_problem(
        self, client, master_annotator, sample_problem, problem_input_data
    ):
        """Master annotators should be able to update core fields on user-created problems."""

        old_hypothesis = sample_problem.hypothesis.text
        old_premise = sample_problem.premises.first().text

        assert sample_problem.dataset == Problem.Dataset.USER
        assert old_hypothesis != problem_input_data["hypothesis"]
        assert old_premise != problem_input_data["premises"][0]

        client.force_login(user=master_annotator)
        response = client.patch(
            f"/api/problem/{sample_problem.id}/",
            problem_input_data,
            content_type="application/json",
        )

        # Status code 200 because KB items are updated in the same view.
        assert response.status_code == status.HTTP_200_OK

        sample_problem.refresh_from_db()
        assert sample_problem.hypothesis.text == problem_input_data["hypothesis"]
        assert sample_problem.premises.first().text == problem_input_data["premises"][0]

    def test_master_annotator_cannot_update_non_user_problem(
        self, client, master_annotator, sample_problem, problem_input_data
    ):
        """Master annotators should not be able to update core fields on non-user-created problems."""
        # Change the sample problem to be non-user-created.
        sample_problem.dataset = Problem.Dataset.SNLI
        sample_problem.save()

        old_hypothesis = sample_problem.hypothesis.text
        old_premise = sample_problem.premises.first().text

        assert old_hypothesis != problem_input_data["hypothesis"]
        assert old_premise != problem_input_data["premises"][0]

        client.force_login(user=master_annotator)
        response = client.patch(
            f"/api/problem/{sample_problem.id}/",
            problem_input_data,
            content_type="application/json",
        )

        # Status code 200 because KB items are updated in the same view.
        assert response.status_code == status.HTTP_200_OK

        sample_problem.refresh_from_db()
        # Core fields should not be updated since the problem is not user-created.
        assert sample_problem.hypothesis.text == old_hypothesis
        assert sample_problem.premises.first().text == old_premise

    # Update hidden status

    def test_unauthenticated_user_cannot_update_problem_visibility(
        self, client, sample_problem
    ):
        """Unauthenticated users should not be able to update problem visibility."""
        response = client.post(
            f"/api/problem/{sample_problem.id}/set-visibility/",
            {"hidden": True},
            content_type="application/json",
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        sample_problem.refresh_from_db()
        assert sample_problem.hidden is False

    def test_visitor_cannot_update_problem_visibility(
        self, client, visitor, sample_problem
    ):
        """Visitors should not be able to update problem visibility."""
        client.force_login(user=visitor)
        response = client.post(
            f"/api/problem/{sample_problem.id}/set-visibility/",
            {"hidden": True},
            content_type="application/json",
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN
        sample_problem.refresh_from_db()
        assert sample_problem.hidden is False

    def test_annotator_cannot_update_problem_visibility(
        self, client, annotator, sample_problem
    ):
        """Annotators should not be able to update problem visibility."""
        client.force_login(user=annotator)
        response = client.post(
            f"/api/problem/{sample_problem.id}/set-visibility/",
            {"hidden": True},
            content_type="application/json",
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN
        sample_problem.refresh_from_db()
        assert sample_problem.hidden is False

    def test_master_annotator_can_update_problem_visibility(
        self, client, master_annotator, sample_problem
    ):
        """Master annotators should be able to update problem visibility."""
        client.force_login(user=master_annotator)
        response = client.post(
            f"/api/problem/{sample_problem.id}/set-visibility/",
            {"hidden": True},
            content_type="application/json",
        )
        assert response.status_code == status.HTTP_200_OK
        sample_problem.refresh_from_db()
        assert sample_problem.hidden is True

    # Update KB annotations

    def test_unauthenticated_user_cannot_update_kb_annotations(
        self, client, sample_problem, problem_input_data
    ):
        response = client.patch(
            f"/api/problem/{sample_problem.id}/",
            problem_input_data,
            content_type="application/json",
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_visitor_cannot_update_kb_annotations(
        self, client, visitor, sample_problem, problem_input_data
    ):
        client.force_login(user=visitor)
        response = client.patch(
            f"/api/problem/{sample_problem.id}/",
            problem_input_data,
            content_type="application/json",
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_annotator_can_create_kb_annotations(
        self, client, annotator, sample_problem, problem_input_data
    ):
        assert sample_problem.knowledgebaseannotations.count() == 0

        client.force_login(user=annotator)
        response = client.patch(
            f"/api/problem/{sample_problem.id}/",
            problem_input_data,
            content_type="application/json",
        )
        assert response.status_code == status.HTTP_200_OK

        sample_problem.refresh_from_db()
        assert (
            sample_problem.knowledgebaseannotations.count() == 1
        ), "Annotator should be able to create a KB annotation."
        kb_annotation = sample_problem.knowledgebaseannotations.first()
        assert (
            kb_annotation.entity1 == problem_input_data["kbItems"][0]["entity1"]
        ), "KB annotation entity1 should match input data."

    def test_annotator_can_update_kb_annotations(
        self, client, annotator, sample_problem, problem_input_data, kb_annotation
    ):
        assert sample_problem.knowledgebaseannotations.count() == 1
        first_kb = sample_problem.knowledgebaseannotations.first()
        assert first_kb.entity1 != problem_input_data["kbItems"][0]["entity1"]

        problem_input_data["kbItems"][0]["id"] = kb_annotation.id

        client.force_login(user=annotator)
        response = client.patch(
            f"/api/problem/{sample_problem.id}/",
            problem_input_data,
            content_type="application/json",
        )
        assert response.status_code == status.HTTP_200_OK

        sample_problem.refresh_from_db()
        kb_annotation.refresh_from_db()

        assert (
            sample_problem.knowledgebaseannotations.count() == 1
        ), "Updating a KB annotation as an annotator should not create a new one."
        assert (
            kb_annotation.entity1 == problem_input_data["kbItems"][0]["entity1"]
        ), "Annotator should be able to update a KB annotation."

    def test_annotator_can_remove_kb_annotations(
        self, client, annotator, sample_problem, problem_input_data, kb_annotation
    ):
        assert kb_annotation.removed_at is None
        problem_input_data["kbItems"] = []

        client.force_login(user=annotator)
        response = client.patch(
            f"/api/problem/{sample_problem.id}/",
            problem_input_data,
            content_type="application/json",
        )
        assert response.status_code == status.HTTP_200_OK

        kb_annotation.refresh_from_db()
        assert (
            kb_annotation.removed_at is not None
        ), "Annotator should be able to mark a KB annotation as removed."

    def test_master_annotator_can_create_kb_annotations(
        self, client, master_annotator, sample_problem, problem_input_data
    ):
        assert sample_problem.knowledgebaseannotations.count() == 0

        client.force_login(user=master_annotator)
        response = client.patch(
            f"/api/problem/{sample_problem.id}/",
            problem_input_data,
            content_type="application/json",
        )
        assert response.status_code == status.HTTP_200_OK

        sample_problem.refresh_from_db()
        assert (
            sample_problem.knowledgebaseannotations.count() == 1
        ), "Master annotator should be able to create a KB annotation."
        kb_annotation = sample_problem.knowledgebaseannotations.first()
        assert (
            kb_annotation.entity1 == problem_input_data["kbItems"][0]["entity1"]
        ), "KB annotation entity1 should match input data."

    def test_master_annotator_can_update_kb_annotations(
        self,
        client,
        master_annotator,
        sample_problem,
        problem_input_data,
        kb_annotation,
    ):
        assert sample_problem.knowledgebaseannotations.count() == 1
        first_kb = sample_problem.knowledgebaseannotations.first()
        assert first_kb.entity1 != problem_input_data["kbItems"][0]["entity1"]

        problem_input_data["kbItems"][0]["id"] = kb_annotation.id

        client.force_login(user=master_annotator)
        response = client.patch(
            f"/api/problem/{sample_problem.id}/",
            problem_input_data,
            content_type="application/json",
        )
        assert response.status_code == status.HTTP_200_OK

        sample_problem.refresh_from_db()
        kb_annotation.refresh_from_db()

        assert (
            sample_problem.knowledgebaseannotations.count() == 1
        ), "Updating a KB annotation as a master annotator should not create a new one."
        assert (
            kb_annotation.entity1 == problem_input_data["kbItems"][0]["entity1"]
        ), "Master annotator should be able to update a KB annotation."

    def test_master_annotator_can_remove_kb_annotations(
        self,
        client,
        master_annotator,
        sample_problem,
        problem_input_data,
        kb_annotation,
    ):
        assert kb_annotation.removed_at is None
        problem_input_data["kbItems"] = []

        client.force_login(user=master_annotator)
        response = client.patch(
            f"/api/problem/{sample_problem.id}/",
            problem_input_data,
            content_type="application/json",
        )
        assert response.status_code == status.HTTP_200_OK

        kb_annotation.refresh_from_db()
        assert (
            kb_annotation.removed_at is not None
        ), "Master annotator should be able to mark a KB annotation as removed."


class TestUserRoleProperties:
    """Tests for user role property methods used by permissions."""

    def test_visitor_cannot_create_problem(self, visitor):
        """Visitor's can_create_problem should return False."""
        assert visitor.can_create_problem is False

    def test_visitor_cannot_edit_problem(self, visitor):
        """Visitor's can_edit_problem should return False."""
        assert visitor.can_edit_problem is False

    def test_annotator_cannot_create_problem(self, annotator):
        """Annotator's can_create_problem should return False."""
        assert annotator.can_create_problem is False

    def test_annotator_cannot_edit_problem(self, annotator):
        """Annotator's can_edit_problem should return False."""
        assert annotator.can_edit_problem is False

    def test_master_annotator_can_create_problem(self, master_annotator):
        """Master annotator's can_create_problem should return True."""
        assert master_annotator.can_create_problem is True

    def test_master_annotator_can_edit_problem(self, master_annotator):
        """Master annotator's can_edit_problem should return True."""
        assert master_annotator.can_edit_problem is True


class TestFirstEndpointPermissions:
    """Tests for the /first endpoint permissions."""

    def test_unauthenticated_user_can_access_first(self, client, sample_problem):
        """Unauthenticated users should be able to access /first endpoint."""
        response = client.get("/api/problem/first/")
        assert response.status_code == status.HTTP_200_OK

    def test_visitor_can_access_first(self, client, visitor, sample_problem):
        """Visitors should be able to access /first endpoint."""
        client.force_login(user=visitor)
        response = client.get("/api/problem/first/")
        assert response.status_code == status.HTTP_200_OK

    def test_annotator_can_access_first(self, client, annotator, sample_problem):
        """Annotators should be able to access /first endpoint."""
        client.force_login(user=annotator)
        response = client.get("/api/problem/first/")
        assert response.status_code == status.HTTP_200_OK

    def test_master_annotator_can_access_first(
        self, client, master_annotator, sample_problem
    ):
        """Master annotators should be able to access /first endpoint."""
        client.force_login(user=master_annotator)
        response = client.get("/api/problem/first/")
        assert response.status_code == status.HTTP_200_OK
