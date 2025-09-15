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

export enum KnowledgeBaseRelationship {
    EQUAL = "EQUAL",
    NOT_EQUAL = "NOT_EQUAL",
    SUBSET = "SUBSET",
    SUPERSET = "SUPERSET",
}

interface KnowledgeBaseItem {
    id: string;
    entity1: string;
    relationship: KnowledgeBaseRelationship;
    entity2: string;
}

interface ProblemBase {
    id: string;
    premises: string[];
    hypothesis: string | null;
    entailmentLabel: EntailmentLabel;
    kbItems: KnowledgeBaseItem[];
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

export type Problem = SickProblem | FracasProblem | SNLIProblem | UserProblem;

interface BaseResponse {
    error: string | null;
}

export interface ProblemResponse extends BaseResponse {
    index: number | null;
    problem: Problem | null;
    firstProblemId: string | null;
    previousProblemId: string | null;
    nextProblemId: string | null;
    lastProblemId: string | null;
    totalProblems: number;
}

export interface SaveProblemResponse extends BaseResponse {
    id: string | null;
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
