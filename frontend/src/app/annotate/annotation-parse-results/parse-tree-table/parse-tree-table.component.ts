import { Component, computed, input } from '@angular/core';
import { TreeNodeComponent } from './tree-node.component';
import { CCGNode, LeafNode, BinaryNode, UnaryNode } from "@/types";
import { TreeNodeDisplay } from "./tree-node.component";
import { TreeWithType } from '../annotation-parse-results.component';

export function buildDisplayTree(node: CCGNode): TreeNodeDisplay {
    if (nodeIsLeaf(node)) {
        return buildLeafNode(node);
    } else if (nodeIsBinary(node)) {
        return buildBinaryNode(node);
    } else if (nodeIsUnary(node)) {
        return buildUnaryNode(node);
    } else {
        return {
            children: [],
            content: "Unknown Node Type",
            type: 'node'
        };
    }
}

function nodeIsLeaf(node: CCGNode): node is LeafNode {
    return !('children' in node);
}

function nodeIsBinary(node: CCGNode): node is BinaryNode {
    return 'children' in node && node.children.length === 2;
}

function nodeIsUnary(node: CCGNode): node is UnaryNode {
    return 'children' in node && node.children.length === 1;
}

function buildLeafNode(node: LeafNode): TreeNodeDisplay {
    // "category" (chunker output) is deliberately unused.
    const [tok, lem, pos, _cat, ner] = node.node;
    return {
        type: 'leaf',
        children: [],
        leaf: { tok, lem, pos, ner }
    };
}

function buildBinaryNode(node: BinaryNode): TreeNodeDisplay {
    const left = buildDisplayTree(node.children[0]);
    const right = buildDisplayTree(node.children[1]);

    const { content, rule } = extractRule(node.node);

    return {
        type: 'node',
        content,
        rule,
        children: [left, right]
    };
}

function buildUnaryNode(node: UnaryNode): TreeNodeDisplay {
    const child = buildDisplayTree(node.children[0]);

    const { content, rule } = extractRule(node.node);

    return {
        type: 'node',
        content,
        rule,
        children: [child]
    };
}

/**
 * Parses a node string to extract the rule and the content.
 *
 * A node string is usually of the form "A[B]", where a is the rule applied
 * and B is the resulting category. The rule is anything everything before
 * the first bracket. Everything within it is the content. For example,
 * in "fa[s:ng-np]", "fa" is the rule and "s:ng-np" is the content.
 *
 * If there are more brackets, we ignore them.
 *
 */
export function extractRule(nodeString: string): { rule: string, content: string; } {
    const firstBracket = nodeString.indexOf('[');
    const lastBracket = nodeString.lastIndexOf(']');

    // Return a fallback value if the string is not what we expect.
    if (firstBracket === -1 || lastBracket === -1 || lastBracket < firstBracket) {
        return {
            rule: "",
            content: nodeString
        };
    }

    const rule = nodeString.slice(0, firstBracket);
    // Strip off any remaining brackets.
    const content = nodeString.slice(firstBracket + 1, lastBracket).replaceAll('[', '').replaceAll(']', '');

    return { rule, content };
}

@Component({
    selector: 'la-parse-tree-table',
    imports: [TreeNodeComponent],
    templateUrl: './parse-tree-table.component.html',
    styleUrl: './parse-tree-table.component.scss'
})
export class ParseTreeTableComponent {
    public readonly tree = input.required<TreeWithType>();

    public displayTree = computed(() => buildDisplayTree(this.tree().tree));
    public treeType = computed(() => this.tree().type);
}
