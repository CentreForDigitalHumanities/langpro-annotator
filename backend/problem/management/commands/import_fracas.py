import xml.etree.ElementTree as ET

from django.core.management.base import BaseCommand
from tqdm import tqdm

from langpro_annotator.logger import logger
from problem.services import FracasData
from problem.models import Problem


class Command(BaseCommand):
    help = "Import FraCaS problems from fracas.xml."

    ENTAILMENT_LABELS = {
        "yes": Problem.EntailmentLabel.ENTAILMENT,
        "no": Problem.EntailmentLabel.CONTRADICTION,
        "unknown": Problem.EntailmentLabel.NEUTRAL,
        "undefined": Problem.EntailmentLabel.UNKNOWN,
    }

    def add_arguments(self, parser):
        parser.add_argument(
            "--file",
            "-f",
            dest="fracas_path",
            type=str,
            required=True,
            help="Path to the fracas.xml file.",
        )

    def handle(self, *args, **options):
        fracas_path = options["fracas_path"]
        self.import_fracas_problems(fracas_path)

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

        existing_fracas_problems = Problem.objects.filter(
            dataset=Problem.Dataset.FRACAS
        )
        existing_fracas_ids = {p.extra_data.get("fracas_id") for p in existing_fracas_problems}

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

            hypothesis = FracasData._text_from_element(problem.find("h"))
            fracas_answer = problem.get("fracas_answer")
            premise_nodes = problem.findall("p")
            premises = [node.text.strip() for node in premise_nodes if node.text]
            entailment_label = self.ENTAILMENT_LABELS.get(
                fracas_answer, Problem.EntailmentLabel.UNKNOWN
            )

            extra_data = FracasData.import_data(problem)

            Problem.objects.create(
                dataset=Problem.Dataset.FRACAS,
                premises=premises,
                hypothesis=hypothesis,
                entailment_label=entailment_label,
                extra_data=extra_data,
            )
            created += 1

        logger.info(
            f"FraCaS problems import complete! Total: {created} | Skipped: {skipped}"
        )
