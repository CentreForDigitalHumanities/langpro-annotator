import { Component, ChangeDetectorRef, input } from '@angular/core';
import { CommonModule } from "@angular/common";
import { Subject } from "rxjs";
import { Dimensions } from '@/types';
import { TableauTree } from './tableau-tree.component';

@Component({
    selector: "la-tableau-svg",
    standalone: true,
    imports: [CommonModule, TableauTree],
    templateUrl: "./tableau-svg.component.svg",
    styleUrl: "./tableau-svg.component.scss",
})
export class TableauSVG {

    treeDimensions$ = new Subject<Dimensions>();
    treeDimensions: Dimensions = {width:0, height: 0};

    constructor(private cdref: ChangeDetectorRef) {}

    onTreeSize(size: Dimensions) {
        this.treeDimensions = size;
    }

    ngAfterViewChecked() {
        this.treeDimensions$.next(this.treeDimensions);
        this.cdref.detectChanges();
    }

    public readonly tree = input.required<any>();
}
