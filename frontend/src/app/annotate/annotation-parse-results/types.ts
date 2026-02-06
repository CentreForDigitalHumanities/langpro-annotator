export interface LeafNode {
    type: 'leaf';
    lem: string;
    tok: string;
    pos: string;
    ner: string;
    cat: string;
}

export interface UnaryNode {
    type: 'unary';
    child: ParseTreeNode;
    rule?: string;
    cat?: string;
}

// Binary node
export interface BinaryNode {
    type: 'binary';
    left: ParseTreeNode;
    right: ParseTreeNode;
    rule?: string; // e.g., "fa", "ba"
    cat?: string; // e.g. "NP", "VP<dcl>"
}

export interface VariableNode {
    type: 'var';
    name: string;
    typeInfo: string;
}


export type ParseTreeNode = LeafNode | UnaryNode | BinaryNode | VariableNode;

export enum ParseTreeType {
    CCG_DERIVATION,
    CCG_TERM,
    CORRECTED_CCG_TERM,
    FIRST_LLF
}

export interface ParseTree {
    type: ParseTreeType;
    root: ParseTreeNode;
}
export interface ParsedSentence {
    id: string;
    text: string;
    parses: ParseTree[];
}

export interface ParseResult {
    parser: string;
    sentences: ParsedSentence[];
}
