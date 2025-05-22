from typing import Literal
from dataclasses import dataclass, field


@dataclass(frozen=True)
class SickProblem:
    pair_id: int
    sentence_one: str
    sentence_two: str
    entailment_label: Literal["neutral", "contradiction", "entailment"]
    relatedness_score: float


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

type CombinedProblem = SickProblem | FracasProblem
