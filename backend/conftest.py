from allauth.account.models import EmailAddress
import pytest
from typing import Generator
from django.test import Client as APIClient
from django.contrib.auth.models import Group, Permission
from rest_framework.test import APIClient as DRFAPIClient

from annotation.models import (
    AnnotationSession,
    KnowledgeBaseAnnotation,
    Label,
    LabelAnnotation,
)
from user.models import User, GroupName
from user.permissions import ANNOTATOR_PERMISSIONS, MASTER_ANNOTATOR_PERMISSIONS
from problem.models import Problem, Sentence


@pytest.fixture()
def user_data():
    return {
        "username": "JohnDoe",
        "email": "j.doe@nowhere.org",
        "password": "secretpassword",
        "first_name": "John",
        "last_name": "Doe",
    }


@pytest.fixture()
def user(db, user_data):
    user = User.objects.create(
        username=user_data["username"],
        email=user_data["email"],
        password=user_data["password"],
        first_name=user_data["first_name"],
        last_name=user_data["last_name"],
    )
    EmailAddress.objects.create(
        user=user, email=user.email, verified=True, primary=True
    )
    return user


@pytest.fixture
def user_client(client, user) -> Generator[APIClient, None, None]:
    client.force_login(user)
    yield client
    client.logout()


@pytest.fixture
def api_client():
    """Returns a DRF APIClient instance."""
    return DRFAPIClient()


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
def hidden_problem(db):
    """Creates a hidden problem for testing."""
    hypothesis = Sentence.objects.create(text="This is a hidden hypothesis.")
    premise = Sentence.objects.create(text="This is a hidden premise.")
    problem = Problem.objects.create(
        dataset=Problem.Dataset.USER,
        hypothesis=hypothesis,
        entailment_label=Problem.EntailmentLabel.NEUTRAL,
        extra_data={},
        hidden=True,
    )
    problem.premises.add(premise)
    return problem

@pytest.fixture
def annotator_session(db, annotator):
    """Annotation session for a user with the 'Annotator' role."""
    return AnnotationSession.objects.create(
        user=annotator,
        created_at="2024-01-01T00:00:00Z",
        updated_at="2024-01-01T00:00:00Z",
    )


@pytest.fixture
def master_annotator_session(db, master_annotator):
    """Creates an annotation session for the master annotator."""
    return AnnotationSession.objects.create(
        user=master_annotator,
        created_at="2024-01-01T00:00:00Z",
        updated_at="2024-01-01T00:00:00Z",
    )


@pytest.fixture
def kb_annotation(db, sample_problem, annotator_session):
    return KnowledgeBaseAnnotation.objects.create(
        problem=sample_problem,
        entity1="e1",
        entity2="e2",
        relationship=KnowledgeBaseAnnotation.Relationship.EQUAL,
        session=annotator_session,
        created_at="2024-01-01T00:00:00Z",
        created_by=annotator_session.user,
    )


@pytest.fixture
def sample_label(db):
    """Create a sample label for testing."""
    return Label.objects.create(
        text="Ambiguous", description="This problem contains ambiguous language."
    )


@pytest.fixture
def label_annotation(db, sample_problem, annotator_session, sample_label):
    """Create a label annotation for testing."""
    return LabelAnnotation.objects.create(
        problem=sample_problem,
        label=sample_label,
        session=annotator_session,
        created_by=annotator_session.user,
    )
