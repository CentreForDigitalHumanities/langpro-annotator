import csv

from django.core.management.base import BaseCommand
from tqdm import tqdm

from langpro_annotator.logger import logger
from problem.models import Problem, Sentence
from problem.services import SNLIData


class Command(BaseCommand):
    help = "Import SNLI 1.0 problems and save them in the DB. Use the flags --dev, --train, --test to specify the paths to the SNLI files. The development set contains 10K problems, the training set contains 550K problems, and the test set contains 10K problems."

    ENTAILMENT_LABELS = {
        "entailment": Problem.EntailmentLabel.ENTAILMENT,
        "contradiction": Problem.EntailmentLabel.CONTRADICTION,
        "neutral": Problem.EntailmentLabel.NEUTRAL,
        "none": Problem.EntailmentLabel.UNKNOWN,  # For empty gold labels.
    }

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

        existing_snli_problems = Problem.objects.filter(dataset=Problem.Dataset.SNLI)
        existing_pair_ids: list[str] = list(
            existing_snli_problems.values_list("extra_data__pair_id", flat=True)
        )

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

                        # Handle empty labels.
                        for key in [
                            "gold_label",
                            "label1",
                            "label2",
                            "label3",
                            "label4",
                            "label5",
                        ]:
                            label_value = problem.get(key, "")
                            if label_value in ["-", ""]:
                                problem[key] = self.ENTAILMENT_LABELS["none"]
                            else:
                                problem[key] = self.ENTAILMENT_LABELS.get(
                                    label_value, Problem.EntailmentLabel.UNKNOWN
                                )

                        extra_data = SNLIData.import_data(problem, subset)

                        premise = Sentence.objects.create(text=problem["sentence1"])

                        hypothesis = Sentence.objects.create(text=problem["sentence2"])

                        new_problem = Problem.objects.create(
                            dataset=Problem.Dataset.SNLI,
                            hypothesis=hypothesis,
                            entailment_label=problem["gold_label"],
                            extra_data=extra_data,
                        )
                        new_problem.premises.set([premise])

                        created += 1
                        existing_pair_ids.append(problem["pairID"])
            except FileNotFoundError:
                logger.warning(f"File {snli_path} not found. Skipping.")

        logger.info(
            f"SNLI problems import complete! Created: {created} | Skipped: {skipped}"
        )
