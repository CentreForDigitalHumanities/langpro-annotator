import { Component, ChangeDetectorRef, ElementRef, input } from '@angular/core';
import { CommonModule } from "@angular/common";
import { Subject } from "rxjs";
import { Dimensions, ProofTree } from '@/types';
import { TableauTree } from './tableau-tree.component';

@Component({
    selector: "la-tableau-svg",
    standalone: true,
    imports: [CommonModule, TableauTree],
    templateUrl: "./tableau-svg.component.svg",
    styleUrl: "./tableau-svg.component.scss",
})
export class TableauSVG {

    public readonly tree = input.required<ProofTree>();

    treeDimensions$ = new Subject<Dimensions>();
    treeDimensions: Dimensions = {width:0, height: 0};

    constructor(
        private cdref: ChangeDetectorRef,
        private element: ElementRef
    ) {}

    onTreeSize(size: Dimensions) {
        this.treeDimensions = size;
    }

    ngAfterViewChecked() {
        this.treeDimensions$.next(this.treeDimensions);
        this.cdref.detectChanges();
        const width = this.treeDimensions.width;
        if (width) this.element.nativeElement.parentElement.scroll({
            left: Math.max(0, width / 2 - 500)
        });
    }
}
