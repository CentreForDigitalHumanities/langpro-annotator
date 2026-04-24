import { Component, input } from '@angular/core';
import { SubscriptPipe } from '@/pipes/subscript-pipe';
import { SelectiveUpperCasePipe } from '@/pipes/selective-upper-case.pipe';
import { TreeType } from '../annotation-parse-results.component';

export interface TreeNodeDisplay {
    type: 'node' | 'leaf' | 'var';
    content?: string;
    rule?: string;
    children: TreeNodeDisplay[];
    // For leaf nodes
    leaf?: {
        tok: string;
        lem: string;
        pos: string;
        ner: string;
    };
    // For variable nodes
    var?: {
        typeInfo: string;
    };
}

@Component({
    selector: 'la-tree-node',
    standalone: true,
    imports: [SubscriptPipe, SelectiveUpperCasePipe],
    templateUrl: './tree-node.component.html',
    styleUrl: './tree-node.component.scss'
})
export class TreeNodeComponent {
    public readonly node = input.required<TreeNodeDisplay>();
    public readonly treeType = input.required<TreeType>();
}
