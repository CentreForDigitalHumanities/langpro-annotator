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

interface ProblemResponseBase {
    id: string;
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

export type ProblemResponse = SickProblemResponse | FracasProblemResponse;

export interface ProofBankStats {
    firstProblemId: string;
    lastProblemId: string;
    totalProblems: number;
}

export enum Dataset {
    SICK = "sick",
    FRACAS = "fracas",
}

export enum Judgement {
    ENTAILMENT = "entailment",
    CONTRADICTION = "contradiction",
    NEUTRAL = "neutral",
    UNKNOWN = "unknown",
}
