import { Component, ElementRef, Input, Output, ViewChild, EventEmitter, ChangeDetectorRef} from '@angular/core';
import { CommonModule } from "@angular/common";
import { BehaviorSubject, Subject } from "rxjs";

interface Dimensions {
    width?: number;
    height?: number;
}

@Component({
    selector: "[term]",
    standalone: true,
    imports: [],
    templateUrl: "./tableau-svg-term.svg",
})
export class TableauTerm {
    @Input()
    public idx?: number;

    @Input()
    public label?: String;

    @Input()
    public term: String = '';

    @Input()
    public rule?: String;

    @ViewChild('idxText')
    idxText?: ElementRef<SVGTextElement>;

    @ViewChild('termText')
    termText?: ElementRef<SVGTextElement>;

    @ViewChild('labelText')
    labelText?: ElementRef<SVGTextElement>;

    @Output()
    public onSize = new EventEmitter<Dimensions>();

    padding = 10;
    termX: number = 0;
    labelX: number = 0;
    idxW: number = 0;
    labelW: number = 0;
    totalW: number = 0;

    ngAfterViewChecked() {
        this.idxW = this.idxText ? this.idxText.nativeElement.getComputedTextLength() + this.padding : 0;
        this.labelW = this.labelText ? this.labelText.nativeElement.getComputedTextLength() + this.padding : 0;
        this.termX = this.idxW;
        this.labelX = this.termText ? this.termX + this.termText.nativeElement.getComputedTextLength() + this.padding : 0;
        this.totalW = this.termText ? this.labelW + this.idxW + this.termText.nativeElement.getComputedTextLength() : 0;

        this.onSize.emit({width: this.totalW});
    }

}

@Component({
    selector: "[tableau-tree]",
    standalone: true,
    imports: [TableauTerm],
    templateUrl: "./tableau-svg-tree.svg",
})
export class TableauTree {
    @Input()
    tree: any;

    levelHeight = 40;

    width: number = 0;
    subWidth: number = 0;
    subHeight: number = 0;

    @Output()
    public onSize = new EventEmitter<Dimensions>();

    updateDimensions(size: Dimensions) {
        this.width = Math.max(this.width, size.width!);
        this.emitSize();
    }

    updateSubDimensions(size: Dimensions) {
        this.subWidth = Math.max(this.subWidth, size.width!);
        this.subHeight = Math.max(this.subHeight, size.height!);
        this.emitSize();
    }

    emitSize() {
        this.onSize.emit({
            width: Math.max(this.subWidth * (this.tree.subtrees?.length ?? 0), this.width),
            height: this.subHeight + 70 * this.tree.nodes.length,
        });
    }

    subtreePosition(idx: number) {
        let widthWithPadding = 1.15 * this.subWidth;
        return widthWithPadding * idx - (widthWithPadding / 2) * (this.tree.subtrees.length - 1);
    }

    nodeHeight(node: any) {
        return node.rule ? 60 : 40;
    }

    totalNodeHeight() {
        return this.tree.nodes.map(this.nodeHeight).reduce((sum: number, h: number) => sum + h, 0);
    }

    nodeY(idx: number) {
        return this.tree.nodes.slice(0, idx).map(this.nodeHeight).reduce((sum: number, h: number) => sum + h, 0);
    }
}

@Component({
    selector: "la-tableau-svg",
    standalone: true,
    imports: [CommonModule, TableauTree],
    templateUrl: "./tableau-svg.component.svg",
    styleUrl: "./tableau-svg.component.scss",
})
export class TableauSVG {

    treeDimensions$: Subject<Dimensions> = new Subject();
    treeDimensions: Dimensions = {width:0, height: 0};

    constructor(private cdref: ChangeDetectorRef) {}

    onTreeSize(size: Dimensions) {
        this.treeDimensions = size;
    }

    ngAfterViewChecked() {
        this.treeDimensions$.next(this.treeDimensions);
        this.cdref.detectChanges();
    }

    tree: any = {
        nodes: [
            {idx: 1, term: 'every@man@(be@work)'},
            {idx: 2, term: 'every@(who@(be@work)@person)@(λ1,a@(expensive@car)@(λ2,have@2@1))'},
            {idx: 3, term: 'every@man@(λ3,a@car@(λ2,own@2@3))'},
            {idx: 4, term: 'be@work', label: 'c1', rule: 'up_mon_fun_some[1,3]'},
            {idx: 5, term: '(λ3,a@car@(λ2,own@2@3))', label: 'c1', rule: 'up_mon_fun_some[1,3]'},
            {idx: 6, term: 'man', label: 'c1', rule: 'up_mon_fun_some[1,3]'},
            {idx: 7, term: 'a@car@(λ2,own@2@c1)', rule: 'pull_arg[5]'},
            {idx: 8, term: 'work', label: 'c1', rule: 'aux_verb[4]'},
            {idx: 9, term: 'be@work', label: 'c1', rule: 'tr_every_c[1,6], [c1]'},
            {idx: 8, term: 'work', label: 'c1', rule: 'aux_verb[9]'},
        ],
        subtrees: [
            {
                nodes: [
                    {idx: 10, term: 'who@(be@work)@person', label: 'c1', rule: 'tr_every[2],[c1]'},
                ],
                subtrees: [
                    {
                        nodes: [
                            {idx: 13, term: 'be@work', label: 'c1', rule: 'fl_conj_who[10]'},
                            {idx: 16, term: 'work', label: 'c1', rule: 'aux_verb[13]'},
                            {term: 'X', rule: 'cl_subcat[16,8]'}
                        ],
                    },
                    {
                        nodes: [
                            {idx: 14, term: 'person', label: 'c1', rule: 'fl_conj_who[10]'},
                            {term: 'X', rule: 'cl_subsumption[14,6]'}
                        ]
                    }
                ]
            },
            {
                nodes: [
                    {idx: 11, term: 'who@(be@work)@person', label: 'c1', rule: 'tr_every[2],[c1]'},
                    {idx: 12, term: '(λ1,a@(expensive@car)@(λ2,have@2@1))', label: 'c1', rule: 'tr_every[2],[c1]'},
                    {idx: 15, term: 'a@(expensive@car)@(λ2,have@2@c1)', label: 'c1', rule: 'pull_arg[12]'},
                    {idx: 17, term: 'be@work', label: 'c1', rule: 'tr_conj_who[11]'},
                    {idx: 18, term: 'person', label: 'c1', rule: 'tr_conj_who[11]' },
                    {idx: 8, term: 'work', label: 'c1', rule: 'aux_verb[17]'},
                    {idx: 19, term: 'a@(expensive@car)', label: '(λ2,have@2@c1)', rule: 'same_args[15,7]'},
                    {idx: 20, term: 'a@car', label: '(λ2,have@2@c1)', rule: 'same_args[15,7]'},
                    {idx: 21, term: 'expensive@car', label: 'c2', rule: 'up_mon_fun[19,20]'},
                    {idx: 22, term: 'car', label: 'c2', rule: 'up_mon_fun[19,20]'},
                    {idx: 23, term: 'car', label: 'c2', rule:'int_mod_tr[21]'},
                    {idx: 24, term: 'expensive', label: 'c2', rule:'int_mod_tr[21]'},
                    {term: 'X', rule: 'cl_subsmption[23,22]'}
                ]
            }
        ]
    }
}
