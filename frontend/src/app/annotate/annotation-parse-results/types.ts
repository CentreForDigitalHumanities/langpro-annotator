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


export type ParseResponseData = {
    ccg_trees: CCGNode[];
    proofs: unknown[];
};
