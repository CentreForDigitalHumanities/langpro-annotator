import { Component, ElementRef, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import { Dimensions } from './types';

@Component({
    selector: "[term]",
    standalone: true,
    imports: [],
    templateUrl: "./tableau-term.component.svg",
})
export class TableauTerm {
    @Input()
    public idx?: number;

    @Input()
    public label?: String;

    /* background color, should probably be replaced by an enum type with the color lookup done elsewhere */
    @Input()
    public bg?: String;

    @Input()
    public term: String = '';

    @Input()
    public end: boolean = false;

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

    padding = 5;
    height = 20;

    idxW = 0;
    termX = 0;
    termW = 0;
    labelX = 0;
    labelW = 0;
    totalW = 0;

    ngAfterViewChecked() {
        this.idxW = this.idxText ? this.idxText.nativeElement.getComputedTextLength() + this.padding : 0;
        this.labelW = this.labelText ? this.labelText.nativeElement.getComputedTextLength() + this.padding : 0;
        this.termX = this.idxW;
        this.termW = this.termText ? this.termText.nativeElement.getComputedTextLength() : 0;
        this.labelX =  this.termX + this.termW + this.padding;
        this.totalW = this.termText ? this.labelW + this.idxW + this.termText.nativeElement.getComputedTextLength() : 0;

        this.onSize.emit({width: this.totalW, height: this.height});
    }

}
