import json
import xml.etree.ElementTree as ET

from django.core.management.base import BaseCommand
from django.db import transaction
from tqdm import tqdm

from langpro_annotator.logger import logger
from problem.services import get_fracas_problems
from problem.models import Problem


class Command(BaseCommand):
    help = "Import FraCaS problems from fracas.xml."

    def add_arguments(self, parser):
        parser.add_argument(
            "--fracas_path",
            type=str,
            default="problem/data/fracas.xml",
            help="Path to the fracas.xml file.",
        )

    def handle(self, *args, **options):
        fracas_path = options["fracas_path"]
        self.import_fracas_problems(fracas_path)

    @staticmethod
    def _text_from_element(element: ET.Element) -> str:
        """
        Extracts stripped text from an XML element, returning an empty string if the element is None or has no text.
        """
        return element.text.strip() if element is not None and element.text else ""

    @staticmethod
    def _annotate_section_subsections(tree: ET.ElementTree) -> None:
        """
        Annotates each problem in the XML tree with its corresponding section, subsection, and subsubsection.
        """
        current_section = None
        current_subsection = None
        current_subsubsection = None

        root = tree.getroot()

        for element in root:
            if element.tag == "comment" and element.attrib.get("class") == "section":
                current_section = element.text.strip()
            elif (
                element.tag == "comment" and element.attrib.get("class") == "subsection"
            ):
                current_subsection = element.text.strip()
            elif (
                element.tag == "comment"
                and element.attrib.get("class") == "subsubsection"
            ):
                current_subsubsection = element.text.strip()
            elif element.tag == "problem":
                if current_section:
                    element.set("section", current_section)
                if current_subsection:
                    element.set("subsection", current_subsection)
                if current_subsubsection:
                    element.set("subsubsection", current_subsubsection)

    def import_fracas_problems(self, fracas_path: str) -> None:
        tree = ET.parse(fracas_path)
        self._annotate_section_subsections(tree)
        root = tree.getroot()
        all_problems = root.findall("problem")

        created = 0
        skipped = 0

        existing_fracas_problems = get_fracas_problems()
        existing_fracas_ids = {p.fracas_id for p in existing_fracas_problems}

        for problem in tqdm(all_problems, desc="Importing FraCaS problems"):
            problem_id = problem.get("id")
            if problem_id is None:
                raise ValueError(
                    "Problem ID is missing in the XML file for problem: {}".format(
                        problem
                    )
                )

            if int(problem_id) in existing_fracas_ids:
                skipped += 1
                continue

            question = self._text_from_element(problem.find("q"))
            hypothesis = self._text_from_element(problem.find("h"))
            answer = self._text_from_element(problem.find("a"))
            note = self._text_from_element(problem.find("note"))

            section = problem.get("section")
            subsection = problem.get("subsection")
            fracas_answer = problem.get("fracas_answer")
            fracas_nonstandard = problem.get("fracas_nonstandard", False) == "true"

            premise_nodes = problem.findall("p")
            premises = [node.text.strip() for node in premise_nodes if node.text]

            Problem.objects.create(
                type=Problem.ProblemType.FRACAS,
                content=json.dumps(
                    {
                        "fracas_id": int(problem_id),
                        "question": question,
                        "hypothesis": hypothesis,
                        "answer": answer,
                        "fracas_answer": fracas_answer,
                        "fracas_non_standard": fracas_nonstandard,
                        "note": note,
                        "section_name": section,
                        "subsection_name": subsection,
                        "premises": premises,
                    }
                ),
            )
            created += 1

        logger.info(
            f"FraCaS problems import complete! Total: {created} | Skipped: {skipped}"
        )
