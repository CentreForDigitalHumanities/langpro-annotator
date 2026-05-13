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

interface BaseAnnotation {
    id: number | null;
    session: number | null;
    createdAt: string;
    createdBy: string;
    removedAt: string | null;
    removedBy: string | null;
    notes: string;
    removable: boolean;
}

export enum KnowledgeBaseRelationship {
    EQUAL = "equal",
    NOT_EQUAL = "not_equal",
    SUBSET = "subset",
    SUPERSET = "superset",
}

export interface KnowledgeBaseAnnotation extends BaseAnnotation {
    entity1: string;
    relationship: KnowledgeBaseRelationship;
    entity2: string;
}

export interface Label {
    id: number;
    text: string;
    description: string;
}

export interface LabelAnnotation extends BaseAnnotation {
    label: Label;
    attachedByCurrentUser: boolean;
}

interface ProblemBase {
    id: number | null;
    base: number | null;
    premises: string[];
    hypothesis: string | null;
    entailmentLabel: EntailmentLabel;
    hidden: boolean;
    kbAnnotations: KnowledgeBaseAnnotation[];
    labelAnnotations: LabelAnnotation[];
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
    first: number | null;
    previous: number | null;
    next: number | null;
    last: number | null;
    total: number;
}

export interface SaveProblemResponse extends BaseResponse {
    id: number | null;
}

export interface SaveLabelsResponse extends BaseResponse {
    ok: boolean;
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


export interface Dimensions {
    width: number;
    height: number;
}

//
// Syntactic parse and proof tree types from the backend
//

export type LeafNode = {
    // Fixed order: rule, token, lemma, POS tag, NER tag, category.
    node: [string, string, string, string, string, string];
};

export type UnaryNode = {
    node: string;
    children: [CCGNode];
};

export type BinaryNode = {
    node: string;
    children: [CCGNode, CCGNode];
};

export type CCGNode = LeafNode | UnaryNode | BinaryNode;

export type ParseTreeType = 'ccg_tree' | 'ccg_term' | 'corr_term' | 'llf';

export interface CCGParse {
    sentence: string;
    ccg_trees: Record<ParseTreeType, CCGNode>;
};

export interface NLTKTree {
    node: string;
    children?: NLTKTree[];
}

export type ParseResponseData = {
    ccg_parses: CCGParse[];
    proofs: {
        entailment: NLTKTree,
        contradiction: NLTKTree,
    };
};

export type ParseResponse = {
    data: ParseResponseData;
    error: string | null;
};

//
// Our internal representation of proof trees
//

export type ProofNode = {
    id?: number;
    rule?: string;
    mod?: string;
    head?: string;
    args?: string;
    sign?: boolean;
    end?: true;
};

export interface ProofTree {
    nodes: ProofNode[];
    subtrees?: ProofTree[];
}

export interface ToggleVisibilityInput {
    hidden: boolean;
}
