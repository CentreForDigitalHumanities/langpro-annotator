import { Component, computed, input } from '@angular/core';
import { BinaryNode, LeafNode, ParseTree, ParseTreeNode, ParseTreeType, UnaryNode, VariableNode } from '../types';
import { TreeNodeComponent, TreeNodeDisplay } from './tree-node.component';

const TreeTypeDisplay: Record<ParseTreeType, string> = {
    [ParseTreeType.CCG_DERIVATION]: 'CCG Derivation',
    [ParseTreeType.CCG_TERM]: 'CCG Term',
    [ParseTreeType.CORRECTED_CCG_TERM]: 'Corrected CCG Term',
    [ParseTreeType.FIRST_LLF]: 'First LLF'
};


@Component({
    selector: 'la-parse-tree-table',
    imports: [TreeNodeComponent],
    templateUrl: './parse-tree-table.component.html',
    styleUrl: './parse-tree-table.component.scss'
})
export class ParseTreeTableComponent {
    public readonly tree = input.required<ParseTree>();

    public rootNode = computed(() => this.buildDisplayTree(this.tree().root));

    public treeType = computed(() => TreeTypeDisplay[this.tree().type] || "Unknown Type");

    private buildDisplayTree(node: ParseTreeNode): TreeNodeDisplay {
        switch (node.type) {
            case 'leaf':
                return this.buildLeafNode(node);
            case 'binary':
                return this.buildBinaryNode(node);
            case 'unary':
                return this.buildUnaryNode(node);
            case 'var':
                return this.buildVariableNode(node);
        }
    }

    private buildLeafNode(node: LeafNode): TreeNodeDisplay {
        return {
            type: 'leaf',
            content: node.cat,
            children: [],
            leaf: {
                tok: node.tok,
                lem: node.lem,
                pos: node.pos,
                ner: node.ner
            }
        };
    }

    private buildVariableNode(node: VariableNode): TreeNodeDisplay {
        return {
            type: 'var',
            content: node.name,
            children: [],
            var: {
                typeInfo: node.typeInfo
            }
        };
    }

    private buildBinaryNode(node: BinaryNode): TreeNodeDisplay {
        const left = this.buildDisplayTree(node.left);
        const right = this.buildDisplayTree(node.right);

        return {
            type: 'node',
            content: node.cat,
            rule: node.rule,
            children: [left, right]
        };
    }

    private buildUnaryNode(node: UnaryNode): TreeNodeDisplay {
        const child = this.buildDisplayTree(node.child);

        return {
            type: 'node',
            content: node.cat,
            rule: node.rule,
            children: [child]
        };
    }

}
