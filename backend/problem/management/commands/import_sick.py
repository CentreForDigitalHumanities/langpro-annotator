import csv

from django.core.management.base import BaseCommand
from tqdm import tqdm

from langpro_annotator.logger import logger
from problem.models import Problem, Sentence
from problem.services import SickData


class Command(BaseCommand):
    help = "Import SICK problems from SICK.txt (a TSV file)."

    ENTAILMENT_LABELS = {
        "NEUTRAL": Problem.EntailmentLabel.NEUTRAL,
        "ENTAILMENT": Problem.EntailmentLabel.ENTAILMENT,
        "CONTRADICTION": Problem.EntailmentLabel.CONTRADICTION,
    }

    def add_arguments(self, parser):
        parser.add_argument(
            "--file",
            "-f",
            dest="sick_path",
            type=str,
            required=True,
            help="Path to the SICK.txt file.",
        )

    def handle(self, *args, **options):
        sick_path = options["sick_path"]
        self.import_sick_problems(sick_path)

    def import_sick_problems(self, sick_path: str) -> None:
        """
        Import SICK problems from SICK.txt (a TSV file) and enter them into the database.
        """

        skipped = 0
        created = 0

        existing_sick_problems = Problem.objects.filter(dataset=Problem.Dataset.SICK)
        existing_pair_ids = {p.extra_data["pair_id"] for p in existing_sick_problems}

        with open(sick_path, "r", encoding="utf-8") as file:
            reader = csv.DictReader(file, delimiter="\t")
            problem_list = list(reader)

            for problem in tqdm(problem_list, desc="Importing SICK problems"):
                if problem["pair_ID"] in existing_pair_ids:
                    skipped += 1
                    continue

                entailment_label = self.ENTAILMENT_LABELS.get(
                    problem["entailment_label"], Problem.EntailmentLabel.UNKNOWN
                )

                extra_data = SickData.import_data(problem)

                premise = Sentence.objects.update_or_create(text=problem["sentence_A"])[0]
                hypothesis = Sentence.objects.update_or_create(text=problem["sentence_B"])[0]

                problem = Problem.objects.create(
                    dataset=Problem.Dataset.SICK,
                    hypothesis=hypothesis,
                    entailment_label=entailment_label,
                    extra_data=extra_data,
                )
                problem.premises.set([premise])
                created += 1

            logger.info(
                f"SICK problems import complete! Created: {created} | Skipped: {skipped}"
            )
