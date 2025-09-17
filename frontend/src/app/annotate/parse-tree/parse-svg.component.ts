import { Component, ChangeDetectorRef, ElementRef, Input, ViewChild, afterNextRender} from '@angular/core';
import { CommonModule } from "@angular/common";
import { Subject } from "rxjs";
import { Dimensions } from '@/types';
import { ParseTree } from './parse-tree.component';
import svgPanZoom from 'svg-pan-zoom';

@Component({
    selector: "la-parse-svg",
    standalone: true,
    imports: [CommonModule, ParseTree],
    templateUrl: "./parse-svg.component.svg",
})
export class ParseSVG {
    @ViewChild('svg')
    svg?: ElementRef<SVGSVGElement>;

    treeDimensions$ = new Subject<Dimensions>();
    treeDimensions: Dimensions = {width:0, height: 0};

    constructor(private cdref: ChangeDetectorRef) {
        afterNextRender(() => {
            svgPanZoom(this.svg!.nativeElement);
        });
    }

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
