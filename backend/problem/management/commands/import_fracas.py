import xml.etree.ElementTree as ET

from django.core.management.base import BaseCommand
from django.db import transaction

from problem.models import FracasPremise, FracasProblem
from problem.utils import progress


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

    def annotate_section_subsections(self, tree: ET.ElementTree) -> None:
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
            elif element.tag == "comment" and element.attrib.get("class") == "subsubsection":
                current_subsubsection = element.text.strip()
            elif element.tag == "problem":
                if current_section:
                    element.set("section", current_section)
                if current_subsection:
                    element.set("subsection", current_subsection)
                if current_subsubsection:
                    element.set("subsubsection", current_subsubsection)

    def import_fracas_problems(self, fracas_path: str) -> None:
        # Parse the XML file
        tree = ET.parse(fracas_path)
        self.annotate_section_subsections(tree)
        root = tree.getroot()

        all_problems = root.findall("problem")
        total = len(all_problems)
        n = 1

        skipped = 0

        def text_from_element(element: ET.Element) -> str:
            """
            Extracts stripped text from an XML element, returning an empty string if the element is None or has no text.
            """
            return element.text.strip() if element is not None and element.text else ""

        for problem in root.findall("problem"):
            problem_id = problem.get("id")

            if problem_id is None:
                raise ValueError(
                    "Problem ID is missing in the XML file for problem: {}".format(
                        problem
                    )
                )

            progress(n, total)
            n += 1

            if FracasProblem.objects.filter(fracas_id=problem_id).exists():
                skipped += 1
                continue

            question = text_from_element(problem.find("q"))
            hypothesis = text_from_element(problem.find("h"))
            answer = text_from_element(problem.find("a"))
            note = text_from_element(problem.find("note"))

            section = problem.get("section")
            subsection = problem.get("subsection")
            fracas_answer = problem.get("fracas_answer")
            fracas_nonstandard = problem.get("fracas_nonstandard", False) == "true"

            with transaction.atomic():
                fracas_problem = FracasProblem.objects.create(
                    fracas_id=int(problem_id),
                    question=question,
                    hypothesis=hypothesis,
                    answer=answer,
                    fracas_answer=fracas_answer,
                    fracas_non_standard=fracas_nonstandard,
                    note=note,
                    section_name=section,
                    subsection_name=subsection,
                )

                premises = problem.findall("p")
                for premise in premises:
                    premise_index = premise.get("idx", None)
                    if premise_index is None:
                        raise ValueError(
                            "Premise index is missing in the XML file for problem: {}".format(
                                problem
                            )
                        )
                    FracasPremise.objects.create(
                        fracas_problem=fracas_problem,
                        premise_index=int(premise_index),
                        premise=premise.text.strip() if premise.text else "",
                    )

        print(f"FraCaS problems import complete! Total: {total} | Skipped: {skipped}")
