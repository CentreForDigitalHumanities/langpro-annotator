from typing import Literal
from dataclasses import dataclass, field


@dataclass(frozen=True)
class SickProblem:
    pair_id: int
    sentence_one: str
    sentence_two: str
    entailment_label: Literal["neutral", "contradiction", "entailment"]
    relatedness_score: float

    def serialize(self) -> dict:
        return {
            "pairId": self.pair_id,
            "sentenceOne": self.sentence_one,
            "sentenceTwo": self.sentence_two,
            "entailmentLabel": self.entailment_label,
            "relatednessScore": self.relatedness_score,
        }


@dataclass(frozen=True)
class FracasProblem:
    fracas_id: int
    question: str
    hypothesis: str
    answer: str
    fracas_answer: Literal["yes", "no", "unknown", "undefined"]
    fracas_non_standard: bool
    note: str
    section_name: str
    subsection_name: str
    premises: list[str] = field(default_factory=list)

    def serialize(self) -> dict:
        return {
            "fracasId": self.fracas_id,
            "question": self.question,
            "hypothesis": self.hypothesis,
            "answer": self.answer,
            "fracasAnswer": self.fracas_answer,
            "fracasNonStandard": self.fracas_non_standard,
            "note": self.note,
            "sectionName": self.section_name,
            "subsectionName": self.subsection_name,
            "premises": self.premises,
        }


@dataclass(frozen=True)
class SNLIProblem:
    pair_id: int
    subset: Literal["train", "dev", "test"]
    sentence_one: str
    sentence_two: str
    gold_label: Literal["neutral", "contradiction", "entailment", "none"]
    labels: list[Literal["neutral", "contradiction", "entailment", "none"]]

    def serialize(self) -> dict:
        return {
            "pairId": self.pair_id,
            "subset": self.subset,
            "sentenceOne": self.sentence_one,
            "sentenceTwo": self.sentence_two,
            "goldLabel": self.gold_label,
            "labels": self.labels,
        }


type CombinedProblem = SickProblem | FracasProblem | SNLIProblem
