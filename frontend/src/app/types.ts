export interface SickProblem {
    pairId: number;
    sentenceOne: string;
    sentenceTwo: string;
    entailmentLabel: "neutral" | "contradiction" | "entailment";
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
    problemId: string;
    error: string | null;
    next: string | null;
    previous: string | null;
    random: string | null;
}

interface SickProblemResponse extends ProblemResponseBase {
    problem: SickProblem | null;
    type: "sick";
}

interface FracasProblemResponse extends ProblemResponseBase {
    problem: FracasProblem | null;
    type: "fracas";
}

export type ProblemResponse = SickProblemResponse | FracasProblemResponse;

export interface ProofBankStats {
    firstProblemId: string;
    lastProblemId: string;
    totalProblems: number;
}
