export interface SickProblem {
    pairId: number;
    sentenceOne: string;
    sentenceTwo: string;
    entailmentLabel: "NEUTRAL" | "CONTRADICTION" | "ENTAILMENT";
    relatednessScore: number;
}

export interface FracasProblem {
    fracasId: number;
    question: string;
    hypothesis: string;
    answer: string;
    fracasAnswer: "yes" | "no" | "unknown" | "undefined";
    fracasNonStandard: boolean;
    note: string;
    sectionName: string;
    subsectionName: string;
    premises: string[];
}

type SNLILabel = "neutral" | "contradiction" | "entailment" | "none";

export interface SNLIProblem {
    pairId: number;
    subset: 'dev' | 'test' | 'train';
    sentenceOne: string;
    sentenceTwo: string;
    goldLabel: SNLILabel;
    labels: SNLILabel[];
}

interface ProblemResponseBase {
    id: number;
    index: number | null;
    error: string | null;
    next: string | null;
    previous: string | null;
    random: string | null;
}

interface SickProblemResponse extends ProblemResponseBase {
    problem: SickProblem | null;
    type: Dataset.SICK;
}

interface FracasProblemResponse extends ProblemResponseBase {
    problem: FracasProblem | null;
    type: Dataset.FRACAS;
}

export interface SNLIProblemResponse extends ProblemResponseBase {
    problem: SNLIProblem | null;
    type: Dataset.SNLI;
}

export type ProblemResponse = SickProblemResponse | FracasProblemResponse | SNLIProblemResponse;

export interface ProofBankStats {
    firstProblemId: string;
    lastProblemId: string;
    totalProblems: number;
}

export enum Dataset {
    SICK = "sick",
    FRACAS = "fracas",
    SNLI = "snli",
}

export enum Judgement {
    ENTAILMENT = "entailment",
    CONTRADICTION = "contradiction",
    NEUTRAL = "neutral",
    UNKNOWN = "unknown",
}
