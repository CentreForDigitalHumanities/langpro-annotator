import { Component, input, OnInit, signal } from '@angular/core';
import { BinaryNode, LeafNode, ParseTree, ParseTreeNode, ParseTreeType, UnaryNode, VariableNode } from '../types';
import { SubscriptAngleBracketsPipe } from './subscript-angle-brackets.pipe';
import { ParseTreeHighlightDirective } from './parse-tree-highlight.directive';

interface BaseCell {
    content: string;
    rule?: string;
    colspan: number;
}

interface NodeCell extends BaseCell {
    type: "node";
}

interface LeafCell extends BaseCell {
    type: "leaf";
    tok: string;
    lem: string;
    pos: string;
    ner: string;
}

interface VarCell extends BaseCell {
    type: "var";
    typeInfo: string;
}

type TableCell = NodeCell | LeafCell | VarCell;

const TreeTypeDisplay: Record<ParseTreeType, string> = {
    [ParseTreeType.CCG_DERIVATION]: 'CCG Derivation',
    [ParseTreeType.CCG_TERM]: 'CCG Term',
    [ParseTreeType.CORRECTED_CCG_TERM]: 'Corrected CCG Term',
    [ParseTreeType.FIRST_LLF]: 'First LLF'
};


@Component({
    selector: 'la-parse-tree-table',
    imports: [SubscriptAngleBracketsPipe, ParseTreeHighlightDirective],
    templateUrl: './parse-tree-table.component.html',
    styleUrl: './parse-tree-table.component.scss'
})
export class ParseTreeTableComponent implements OnInit {
    public readonly tree = input.required<ParseTree>();

    public readonly tableRows = signal<TableCell[][]>([]);

    ngOnInit(): void {
        const root = this.tree().root;
        this.tableRows.set(this.createTableRows(root));
    }

    public getTreeTypeDisplay(type: ParseTreeType): string {
        return TreeTypeDisplay[type] || "Unknown Type";
    }

    private createTableRows(node: ParseTreeNode): TableCell[][] {
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

    private getRowWidth(row: TableCell[]): number {
        return row.reduce((sum, cell) => sum + cell.colspan, 0);
    }

    private buildLeafNode(node: LeafNode): TableCell[][] {
        return [[{
            ...node,
            content: node.cat,
            colspan: 1,
        }]];
    }

    private buildVariableNode(node: VariableNode): TableCell[][] {
        return [[{
            type: "var",
            colspan: 1,
            content: node.name,
            typeInfo: node.typeInfo
        }]];
    }

    private buildBinaryNode(node: BinaryNode): TableCell[][] {
        const leftRows = this.createTableRows(node.left);
        const rightRows = this.createTableRows(node.right);

        // Pad shorter side with empty rows
        const maxRows = Math.max(leftRows.length, rightRows.length);

        while (leftRows.length < maxRows) {
            const previousRow = leftRows[leftRows.length - 1];
            const leftWidth = previousRow ? this.getRowWidth(previousRow) : 1;
            leftRows.push([{ content: '', colspan: leftWidth, type: "node" }]);
        }
        while (rightRows.length < maxRows) {
            const previousRow = rightRows[rightRows.length - 1];
            const rightWidth = previousRow ? this.getRowWidth(previousRow) : 1;
            rightRows.push([{ content: '', colspan: rightWidth, type: "node" }]);
        }

        // Combine rows horizontally
        const combinedRows: TableCell[][] = [];
        for (let i = 0; i < maxRows; i++) {
            combinedRows.push([...leftRows[i], ...rightRows[i]]);
        }

        // Add parent node row
        const binaryTotalWidth = this.getRowWidth(combinedRows[0]);
        combinedRows.push([{
            content: node.cat,
            rule: node.rule,
            colspan: binaryTotalWidth,
            type: "node"
        }]);

        return combinedRows;
    }

    private buildUnaryNode(node: UnaryNode): TableCell[][] {
        const childRows = this.createTableRows(node.child);
        const unaryTotalWidth = this.getRowWidth(childRows[0]);
        childRows.push([{
            content: node.cat,
            rule: node.rule,
            colspan: unaryTotalWidth,
            type: "node"
        }]);
        return childRows;
    }

}
