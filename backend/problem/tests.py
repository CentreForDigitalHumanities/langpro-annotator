from django.test import TestCase
from rest_framework.exceptions import ValidationError

from .serializers import ProblemInputSerializer, KnowledgeBaseSerializer
from .models import Problem, Sentence, KnowledgeBase


class ProblemInputSerializerTest(TestCase):
    def setUp(self):
        self.h_sent = Sentence.objects.create(text="Hypothesis")
        self.p_sent = Sentence.objects.create(text="Premise")
        self.user_problem = Problem.objects.create(
            dataset=Problem.Dataset.USER,
            hypothesis=self.h_sent,
            extra_data={},
        )
        self.user_problem.premises.add(self.p_sent)

        self.non_user_problem = Problem.objects.create(
            dataset=Problem.Dataset.SICK,
            hypothesis=self.h_sent,
            extra_data={},
        )
        self.non_user_problem.premises.add(self.p_sent)

        self.kb_item = KnowledgeBase.objects.create(
            problem=self.user_problem,
            entity1="e1",
            entity2="e2",
            relationship=KnowledgeBase.Relationship.EQUAL,
        )

    def test_valid_create_data(self):
        """Test valid data for creating a problem."""
        data = {
            "premises": ["A cat is running."],
            "hypothesis": "A cat is moving.",
            "kbItems": [],
        }
        serializer = ProblemInputSerializer(data=data)
        self.assertTrue(serializer.is_valid(raise_exception=True))

    def test_valid_update_data(self):
        """Test valid data for updating a user problem."""
        data = {
            "id": self.user_problem.pk,
            "premises": ["The cat is on the mat."],
            "hypothesis": "A cat is on a mat.",
            "kbItems": [
                {
                    "id": self.kb_item.pk,
                    "entity1": "e1",
                    "entity2": "e2",
                    "relationship": "equal",
                },
                {"entity1": "new_e1", "entity2": "new_e2", "relationship": "subset"},
            ],
        }
        serializer = ProblemInputSerializer(data=data)
        self.assertTrue(serializer.is_valid(raise_exception=True))

    def test_valid_create_data_no_id(self):
        """Test valid data for creating a problem without an ID."""
        data = {
            "premises": ["A dog barks."],
            "hypothesis": "A dog makes noise.",
            "kbItems": [],
        }
        serializer = ProblemInputSerializer(data=data)
        self.assertTrue(serializer.is_valid(raise_exception=True))

    def test_invalid_id_non_existent(self):
        """Test that a non-existent problem ID is invalid."""
        data = {
            "id": 9999,
            "premises": ["premise"],
            "hypothesis": "hypothesis",
            "kbItems": [],
        }
        serializer = ProblemInputSerializer(data=data)
        with self.assertRaises(ValidationError) as context:
            serializer.is_valid(raise_exception=True)
        self.assertIn("does not exist", str(context.exception))

    def test_invalid_id_not_user_problem(self):
        """Test that a non-user problem ID is invalid."""
        data = {
            "id": self.non_user_problem.pk,
            "premises": ["premise"],
            "hypothesis": "hypothesis",
            "kbItems": [],
        }
        serializer = ProblemInputSerializer(data=data)
        with self.assertRaises(ValidationError) as context:
            serializer.is_valid(raise_exception=True)
        self.assertIn("not a user problem", str(context.exception))

    def test_empty_premises_invalid(self):
        """Test that an empty list of premises is invalid."""
        data = {"premises": [], "hypothesis": "hypothesis", "kbItems": []}
        serializer = ProblemInputSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("premises", serializer.errors)

    def test_blank_premise_invalid(self):
        """Test that a blank premise string is invalid."""
        data = {"premises": [""], "hypothesis": "hypothesis", "kbItems": []}
        serializer = ProblemInputSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("premises", serializer.errors)

    def test_blank_hypothesis_invalid(self):
        """Test that a blank hypothesis is invalid."""
        data = {"premises": ["premise"], "hypothesis": "", "kbItems": []}
        serializer = ProblemInputSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("hypothesis", serializer.errors)

    def test_invalid_kb_item_id(self):
        """Test that a non-existent kbItem ID is invalid."""
        data = {
            "premises": ["premise"],
            "hypothesis": "hypothesis",
            "kbItems": [{"id": 9999, "relationship": "equal"}],
        }
        serializer = ProblemInputSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("kbItems", serializer.errors)

    def test_kb_item_missing_relationship(self):
        """Test that a kbItem missing a relationship is invalid."""
        data = {
            "premises": ["premise"],
            "hypothesis": "hypothesis",
            "kbItems": [{"entity1": "e1", "entity2": "e2"}],
        }
        serializer = ProblemInputSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("kbItems", serializer.errors)
