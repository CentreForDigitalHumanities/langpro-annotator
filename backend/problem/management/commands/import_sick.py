import csv
import json

from django.core.management.base import BaseCommand
from tqdm import tqdm

from langpro_annotator.logger import logger
from problem.models import Problem
from problem.services import get_sick_problems


class Command(BaseCommand):
    help = "Import SICK problems from SICK.txt (a TSV file)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--sick_path",
            type=str,
            default="problem/data/SICK.txt",
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

        existing_sick_problems = get_sick_problems()
        existing_pair_ids = {p.pair_id for p in existing_sick_problems}

        with open(sick_path, "r", encoding="utf-8") as file:
            reader = csv.DictReader(file, delimiter="\t")
            problem_list = list(reader)

            for problem in tqdm(problem_list, desc="Importing SICK problems"):
                if problem["pair_ID"] in existing_pair_ids:
                    skipped += 1
                    continue

                created += 1
                Problem.objects.create(
                    type=Problem.ProblemType.SICK,
                    content=json.dumps(problem),
                )

            logger.info(
                f"SICK problems import complete! Created: {created} | Skipped: {skipped}"
            )
