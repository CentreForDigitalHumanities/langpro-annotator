// TODO: update these types to match the actual data structure returned
// by LangPro's syntactic parser.

export interface ParseResult {
    parser: string;
    sentences: ParsedSentence[];
}

export interface ParsedSentence {
    id: string;
    text: string;
    parses: ParseTree[];
}

export interface ParseTree {
    type: ParseTreeType;
    root: ParseTreeNode;
}

export enum ParseTreeType {
    CCG_DERIVATION,
    CCG_TERM,
    CORRECTED_CCG_TERM,
    FIRST_LLF
}

export type ParseTreeNode = LeafNode | UnaryNode | BinaryNode | VariableNode;

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
    cat: string;
    rule?: string;
}

// Binary node
export interface BinaryNode {
    type: 'binary';
    left: ParseTreeNode;
    right: ParseTreeNode;
    cat: string; // e.g. "NP", "VP<dcl>"
    rule?: string; // e.g., "fa", "ba"
}

export interface VariableNode {
    type: 'var';
    name: string;
    typeInfo: string;
}
