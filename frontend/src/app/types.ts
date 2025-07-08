interface SickData {
    pairId: number;
    relatednessScore: number;
}

interface FracasData {
    fracasId: number;
    question: string;
    answer: string;
    note: string;
    sectionName: string;
    subsectionName: string;
    fracasNonStandard: boolean;
}

interface SNLIData {
    pairId: number;
    subset: "dev" | "test" | "train";
    label1: string;
    label2: string;
    label3: string;
    label4: string;
    label5: string;
}

interface ProblemBase {
    id: number;
    premises: string[];
    hypothesis: string | null;
    entailmentLabel: EntailmentLabel;
}

interface SickProblem extends ProblemBase {
    dataset: Dataset.SICK;
    extraData: SickData;
}

interface FracasProblem extends ProblemBase {
    dataset: Dataset.FRACAS;
    extraData: FracasData;
}

interface SNLIProblem extends ProblemBase {
    dataset: Dataset.SNLI;
    extraData: SNLIData;
}

interface UserProblem extends ProblemBase {
    dataset: Dataset.USER;
    extraData: null;
}

type Problem = SickProblem | FracasProblem | SNLIProblem | UserProblem;

export interface ProblemResponse {
    id: number;
    index: number | null;
    next: string | null;
    previous: string | null;
    random: string | null;
    error: string | null;
    problem: Problem | null;
}

export interface ProofBankStats {
    firstProblemId: string;
    lastProblemId: string;
    totalProblems: number;
}

export enum Dataset {
    SICK = "sick",
    FRACAS = "fracas",
    SNLI = "snli",
    USER = "user",
}

export enum EntailmentLabel {
    ENTAILMENT = "entailment",
    CONTRADICTION = "contradiction",
    NEUTRAL = "neutral",
    UNKNOWN = "unknown",
}
