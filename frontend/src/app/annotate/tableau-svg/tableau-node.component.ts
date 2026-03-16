import { Component, ElementRef, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import { Dimensions } from '@/types';

@Component({
    selector: "[node]",
    standalone: true,
    imports: [],
    templateUrl: "./tableau-node.component.svg",
    styleUrl: "./tableau-node.component.scss",
})
export class TableauNode {
    @Input()
    public id?: number;

    @Input()
    public args?: string;

    /* background color, should probably be replaced by an enum type with the color lookup done elsewhere */
    @Input()
    public bg?: string;

    @Input()
    public head: string = '';

    @Input()
    public end: boolean = false;

    @Input()
    public rule?: string;

    @ViewChild('idText')
    idText?: ElementRef<SVGTextElement>;

    @ViewChild('headText')
    headText?: ElementRef<SVGTextElement>;

    @ViewChild('argsText')
    argsText?: ElementRef<SVGTextElement>;

    @Output()
    public onSize = new EventEmitter<Dimensions>();

    padding = 5;
    height = 20;

    idW = 0;
    headX = 0;
    headW = 0;
    argsX = 0;
    argsW = 0;
    totalW = 0;

    ngAfterViewChecked() {
        this.idW = this.idText ? this.idText.nativeElement.getComputedTextLength() + this.padding : 0;
        this.argsW = this.argsText ? this.argsText.nativeElement.getComputedTextLength() + this.padding : 0;
        this.headX = this.idW;
        this.headW = this.headText ? this.headText.nativeElement.getComputedTextLength() : 0;
        this.argsX =  this.headX + this.headW + this.padding;
        this.totalW = this.headText ? this.argsW + this.idW + this.headText.nativeElement.getComputedTextLength() : 0;

        this.onSize.emit({width: this.totalW, height: this.height});
    }

}
