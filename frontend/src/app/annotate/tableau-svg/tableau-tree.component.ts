import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TableauNode } from './tableau-node.component';
import { Dimensions } from '@/types';
import { sum } from "@/util";

@Component({
    selector: "[tableau-tree]",
    standalone: true,
    imports: [TableauNode],
    templateUrl: "./tableau-tree.component.svg",
    styleUrl: "./tableau-tree.component.scss",
})
export class TableauTree {
    expanded: boolean[] = [];

    _tree: any;
    @Input()
    get tree(): any {
        return this._tree;
    }

    set tree(value: any) {
        this._tree = value;
        this.expanded = value.nodes.map(() => true);
    }

    levelHeight = 40;

    /* Width of the tree node, has to be determined dynamically via onSize events from nodes */
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
            width: Math.max(this.subWidth * (this.tree.subtrees?.length ?? 0), this.width),
            height: this.subHeight + this.totalNodeHeight() + (this.tree.subtrees?.length ? this.levelHeight : 0)
        });
    }

    /* Determines the X coordinate of where subtree of index `idx` should be drawn */
    subtreePosition(idx: number) {
        let widthWithPadding = 1.15 * this.subWidth;
        return widthWithPadding * idx - (widthWithPadding / 2) * (this.tree.subtrees.length - 1);
    }

    /* Generates a path definition for linking the end of the current node to subtree index `idx` */
    subtreeLinkPath(idx: number) {
        return [
            // move to end of current node
            `M 0 ${this.totalNodeHeight() - 15 }`,
            // curve to half-way to subtree
            `q 0 ${this.levelHeight/2} ${this.subtreePosition(idx)/2 } ${this.levelHeight/2}`,
            // curve from half-way to subtree, to subtree position
            `q ${this.subtreePosition(idx)/2} 0 ${this.subtreePosition(idx)/2} ${this.levelHeight/2}`
        ].join(' ');
    }

    nodeHeight(node: any) {
        // note that in this case height includes bottom padding for the node
        return node.rule ? 60 : 40;
    }

    totalNodeHeight() {
        return sum(this.tree.nodes.map(this.nodeHeight));
    }

    nodeY(idx: number) {
        // y position of a given node is the sum of heights of all preceeding nodes
        return sum(this.tree.nodes.slice(0, idx).map(this.nodeHeight));
    }

    nodeClick(idx: number) {
        // the last node can't be collapsed
        // unless there are subtrees
        if (idx < this.expanded.length - 1 || this.tree.subtrees) {
            this.expanded[idx] = !this.expanded[idx];
        }
    }

    visibleNodes() {
        const firstCollpased = this.expanded.indexOf(false);
        if (firstCollpased == -1) {
            return this.tree.nodes;
        }
        return this.tree.nodes.slice(0, firstCollpased + 1);
    }

    showSubtrees() {
        // if any of the current level nodes is collapsed, this also means
        // we shouldn't render any subtrees
        return this.expanded.indexOf(false) == -1;
    }
}
