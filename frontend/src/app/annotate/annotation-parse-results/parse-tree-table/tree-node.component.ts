import { Component, input } from '@angular/core';
import { SubscriptAngleBracketsPipe } from './subscript-angle-brackets.pipe';

export interface TreeNodeDisplay {
    type: 'node' | 'leaf' | 'var';
    content: string;
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
    imports: [SubscriptAngleBracketsPipe],
    templateUrl: './tree-node.component.html',
    styleUrl: './tree-node.component.scss'
})
export class TreeNodeComponent {
    public readonly node = input.required<TreeNodeDisplay>();
}
