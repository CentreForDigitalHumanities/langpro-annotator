import { Component, ChangeDetectorRef, Input} from '@angular/core';
import { CommonModule } from "@angular/common";
import { Subject } from "rxjs";
import { Dimensions } from '@/types';
import { ParseTree } from './parse-tree.component';

@Component({
    selector: "la-parse-svg",
    standalone: true,
    imports: [CommonModule, ParseTree],
    templateUrl: "./parse-svg.component.svg",
})
export class ParseSVG {

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

    @Input()
    tree: any = {};
}
