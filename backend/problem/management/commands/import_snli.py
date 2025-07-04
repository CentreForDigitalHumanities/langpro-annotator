import csv

from django.core.management.base import BaseCommand
from tqdm import tqdm

from langpro_annotator.logger import logger
from problem.models import Problem


class Command(BaseCommand):
    help = "Import SNLI 1.0 problems and save them in the DB. Use the flags --dev, --train, --test to specify the paths to the SNLI files. The development set contains 10K problems, the training set contains 550K problems, and the test set contains 10K problems."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dev",
            action="store",
            help="Path to the SNLI development set (10K problems) (snli_1.0_dev.txt).",
        )
        parser.add_argument(
            "--train",
            action="store",
            help="Path to the SNLI training set (550K problems) (snli_1.0_train.txt).",
        )
        parser.add_argument(
            "--test",
            action="store",
            help="Path to the SNLI test set (10K problems) (snli_1.0_test.txt).",
        )

    def handle(self, *args, **options):
        snli_paths = []
        if options["dev"]:
            snli_paths.append(("dev", options["dev"]))
        if options["train"]:
            snli_paths.append(("train", options["train"]))
        if options["test"]:
            snli_paths.append(("test", options["test"]))

        if len(snli_paths) == 0:
            logger.error(
                "No paths to SNLI datafiles provided. Please specify at least "
                "one of --dev, --train, or --test."
            )
            return

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

                        Problem.objects.create(
                            type=Problem.ProblemType.SNLI,
                            content=problem,
                        )
                        created += 1
                        existing_pair_ids.add(problem["pairID"])
            except FileNotFoundError:
                logger.warning(f"File {snli_path} not found. Skipping.")

        logger.info(
            f"SNLI problems import complete! Created: {created} | Skipped: {skipped}"
        )
