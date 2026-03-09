import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ParseTerm } from './parse-term.component';
import { Dimensions, CCGTerm } from '@/types';
import { TreeNode } from "@/tree";

@Component({
    selector: "[parse-tree]",
    standalone: true,
    imports: [ParseTerm],
    templateUrl: "./parse-tree.component.svg",
    styleUrl: "./parse-tree.component.scss",
})
export class ParseTree {
    expanded: boolean = true;

    @Input()
    treeNode: TreeNode<CCGTerm> = {value: [], children: []};

    levelHeight = 40;

    /* Width of the tree node, has to be determined dynamically via onSize events from terms */
    width = 0;
    /* Height isn't stored in a member variable, because it can be computed as needed */

    /* Dimensions of the biggest subtree.
       Width is used to align all subtrees.
       Height is used to determine the overall height of the tree. */
    subWidth = 0;
    subHeight = 0;

    @Output()
    public onSize = new EventEmitter<Dimensions>();

    updateDimensions(size: Dimensions) {
        this.width = Math.max(this.width, size.width!);
        this.emitSize();
    }

    /* keep track of the current node's biggest subtree using onSize events */
    updateSubDimensions(size: Dimensions) {
        this.subWidth = Math.max(this.subWidth, size.width!);
        this.subHeight = Math.max(this.subHeight, size.height!);
        this.emitSize();
    }

    emitSize() {
        this.onSize.emit({
            width: Math.max(this.subWidth * (this.treeNode?.children?.length ?? 0), this.width),
            height: this.subHeight + this.nodeHeight() + (this.treeNode?.children?.length ? this.levelHeight : 0)
        });
    }

    /* Determines the X coordinate of where subtree of index `idx` should be drawn */
    subtreePosition(idx: number) {
        let widthWithPadding = 1.15 * this.subWidth;
        return widthWithPadding * idx - (widthWithPadding / 2) * (this.treeNode.children.length - 1);
    }

    /* Generates a path definition for linking the end of the current node to subtree index `idx` */
    subtreeLinkPath(idx: number) {
        return [
            // move to end of current node
            `M 0 ${this.nodeHeight() - 15 }`,
            // curve to half-way to subtree
            `q 0 ${this.levelHeight/2} ${this.subtreePosition(idx)/2 } ${this.levelHeight/2}`,
            // curve from half-way to subtree, to subtree position
            `q ${this.subtreePosition(idx)/2} 0 ${this.subtreePosition(idx)/2} ${this.levelHeight/2}`
        ].join(' ');
    }

    nodeHeight() {
        return 40;
    }

    termClick() {
        this.expanded = !this.expanded;
    }

    showSubtrees() {
        return this.expanded;
    }
}
