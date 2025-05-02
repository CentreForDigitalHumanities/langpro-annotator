import csv

from django.core.management.base import BaseCommand
from problem.utils import progress
from problem.models import SickProblem


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

    def import_sick_problems(self, sick_path: str = "./SICK.txt") -> None:
        """
        Import SICK problems from SICK.txt (a TSV file) and enter them into the database.
        """

        print("Importing SICK problems...")

        skipped = 0

        with open(sick_path, "r", encoding="utf-8") as file:
            reader = csv.DictReader(file, delimiter="\t")
            problem_list = list(reader)

            total = len(problem_list)
            n = 1

            for row in problem_list:
                progress(n, total)
                n += 1
                if SickProblem.objects.filter(pair_id=row["pair_ID"]).exists():
                    skipped += 1
                    continue

                SickProblem.objects.create(
                    pair_id=row["pair_ID"],
                    sentence_one=row["sentence_A"],
                    sentence_two=row["sentence_B"],
                    entailment_label=row["entailment_label"],
                    relatedness_score=row["relatedness_score"],
                )

            print(f"SICK problems import complete! Total: {total} | Skipped: {skipped}")
