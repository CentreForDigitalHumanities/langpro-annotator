import csv

from django.core.management.base import BaseCommand
from tqdm import tqdm

from langpro_annotator.logger import logger
from problem.models import Problem


class Command(BaseCommand):
    help = "Import SNLI 1.0 problems from snli_1.0_dev.txt (10K problems). Run with --full to import the problems from snli_1.0_train.txt (550K) and snli_1.0_test.txt (10K) as well."

    def add_arguments(self, parser):
        parser.add_argument(
            "--full",
            action="store_true",
            help="Import the full SNLI dataset (dev, train, and test sets). Warning: this will take a few minutes.",
        )

    def handle(self, *args, **options):
        snli_paths = [("dev", "problem/data/snli_1.0_dev.txt")]
        if options["full"]:
            snli_paths.extend(
                [
                    ("train", "problem/data/snli_1.0_train.txt"),
                    ("test", "problem/data/snli_1.0_test.txt"),
                ]
            )
        self.import_snli_problems(snli_paths)

    def import_snli_problems(self, snli_paths: list[tuple[str, str]]) -> None:
        """
        Import SNLI 1.0 problems from a list of SNLI TSV files and enter them into the database.
        """

        skipped = 0
        created = 0

        existing_snli_problems = Problem.objects.filter(type=Problem.ProblemType.SNLI)
        existing_pair_ids = {p.content.get("pairID") for p in existing_snli_problems}

        for subset, snli_path in snli_paths:
            try:
                with open(snli_path, "r", encoding="utf-8") as file:
                    reader = csv.DictReader(file, delimiter="\t")
                    problem_list = list(reader)

                    for problem in tqdm(
                        problem_list,
                        desc=f"Importing SNLI problems from {snli_path}",
                    ):
                        if problem["pairID"] in existing_pair_ids:
                            skipped += 1
                            continue

                        problem["subset"] = subset

                        # Handle empty gold labels.
                        if problem["gold_label"] == "-":
                            problem["gold_label"] = "none"

                        # Handle empty labels.
                        for key in ["label1", "label2", "label3", "label4", "label5"]:
                            if problem[key] == "":
                                problem[key] = "none"

                        created += 1
                        Problem.objects.create(
                            type=Problem.ProblemType.SNLI,
                            content=problem,
                        )
                        existing_pair_ids.add(problem["pairID"])
            except FileNotFoundError:
                logger.warning(f"File {snli_path} not found. Skipping.")

        logger.info(
            f"SNLI problems import complete! Created: {created} | Skipped: {skipped}"
        )
