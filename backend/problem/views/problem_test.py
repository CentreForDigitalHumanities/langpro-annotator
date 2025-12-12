import pytest
from django.contrib.auth.models import Group, Permission
from rest_framework import status

from problem.models import Problem, Sentence
from user.models import User, GroupName
from user.permissions import ANNOTATOR_PERMISSIONS, MASTER_ANNOTATOR_PERMISSIONS


@pytest.fixture
def visitor(db):
    """Creates a visitor user (no special permissions)."""
    return User.objects.create_user(
        username="visitor",
        email="visitor@test.com",
        password="testpassword",
    )


@pytest.fixture
def annotator(db):
    """Creates an annotator user with annotator permissions."""
    user = User.objects.create_user(
        username="annotator",
        email="annotator@test.com",
        password="testpassword",
    )
    group, _ = Group.objects.get_or_create(name=GroupName.ANNOTATORS)

    for app_label, codename in ANNOTATOR_PERMISSIONS:
        try:
            perm = Permission.objects.get(
                content_type__app_label=app_label,
                codename=codename,
            )
            group.permissions.add(perm)
        except Permission.DoesNotExist:
            pass
    user.groups.add(group)
    return user


@pytest.fixture
def master_annotator(db):
    """Creates a master annotator user with master annotator permissions."""
    user = User.objects.create_user(
        username="master_annotator",
        email="master@test.com",
        password="testpassword",
    )
    group, _ = Group.objects.get_or_create(name=GroupName.MASTER_ANNOTATORS)

    for app_label, codename in MASTER_ANNOTATOR_PERMISSIONS:
        try:
            perm = Permission.objects.get(
                content_type__app_label=app_label,
                codename=codename,
            )
            group.permissions.add(perm)
        except Permission.DoesNotExist:
            pass
    user.groups.add(group)
    return user


@pytest.fixture
def sample_problem(db):
    """Creates a sample problem for testing."""
    hypothesis = Sentence.objects.create(text="This is a hypothesis.")
    premise = Sentence.objects.create(text="This is a premise.")
    problem = Problem.objects.create(
        dataset=Problem.Dataset.USER,
        hypothesis=hypothesis,
        entailment_label=Problem.EntailmentLabel.NEUTRAL,
        extra_data={},
    )
    problem.premises.add(premise)
    return problem


@pytest.fixture
def problem_input_data():
    """Returns valid input data for creating/updating a problem."""
    return {
        "premises": ["Test premise 1", "Test premise 2"],
        "hypothesis": "Test hypothesis",
        "entailmentLabel": "neutral",
        "kbItems": [],
    }


class TestProblemViewPermissions:
    """
    Tests for problem view permissions as documented in the README.
    """

    # List / browse

    def test_unauthenticated_user_can_list_problems(self, client, sample_problem):
        """Unauthenticated users should be able to browse problems (read-only)."""
        response = client.get("/api/problem/")
        assert response.status_code == status.HTTP_200_OK

    def test_visitor_can_list_problems(self, client, visitor, sample_problem):
        """Visitors should be able to browse problems."""
        client.force_login(user=visitor)
        response = client.get("/api/problem/")
        assert response.status_code == status.HTTP_200_OK

    def test_annotator_can_list_problems(self, client, annotator, sample_problem):
        """Annotators should be able to browse problems."""
        client.force_login(user=annotator)
        response = client.get("/api/problem/")
        assert response.status_code == status.HTTP_200_OK

    def test_master_annotator_can_list_problems(
        self, client, master_annotator, sample_problem
    ):
        """Master annotators should be able to browse problems."""
        client.force_login(user=master_annotator)
        response = client.get("/api/problem/")
        assert response.status_code == status.HTTP_200_OK

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

    # Update

    def test_unauthenticated_user_cannot_update_problem(
        self, client, sample_problem, problem_input_data
    ):
        """Unauthenticated users should not be able to update problems."""
        response = client.patch(
            f"/api/problem/{sample_problem.id}/",
            problem_input_data,
            content_type="application/json",
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_visitor_cannot_update_problem(
        self, client, visitor, sample_problem, problem_input_data
    ):
        """Visitors should not be able to update problems."""
        client.force_login(user=visitor)
        response = client.patch(
            f"/api/problem/{sample_problem.id}/",
            problem_input_data,
            content_type="application/json",
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_annotator_cannot_update_problem(
        self, client, annotator, sample_problem, problem_input_data
    ):
        """Annotators should not be able to update problems."""
        client.force_login(user=annotator)
        response = client.patch(
            f"/api/problem/{sample_problem.id}/",
            problem_input_data,
            content_type="application/json",
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_master_annotator_can_update_problem(
        self, client, master_annotator, sample_problem, problem_input_data
    ):
        """Master annotators should be able to update user-created problems."""
        client.force_login(user=master_annotator)
        response = client.patch(
            f"/api/problem/{sample_problem.id}/",
            problem_input_data,
            content_type="application/json",
        )
        assert response.status_code == status.HTTP_200_OK


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
