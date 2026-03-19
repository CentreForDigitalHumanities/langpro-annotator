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
    public mod?: string;

    @Input()
    public args?: string;

    @Input()
    public sign?: boolean;

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

    @ViewChild('modText')
    modText?: ElementRef<SVGTextElement>;

    @ViewChild('argsText')
    argsText?: ElementRef<SVGTextElement>;

    @ViewChild('ruleText')
    ruleText?: ElementRef<SVGTextElement>;

    @Output()
    public onSize = new EventEmitter<Dimensions>();

    padding = 5;
    height = 20;

    idW = 0;
    modX = 0;
    modW = 0;
    headX = 0;
    headW = 0;
    argsX = 0;
    argsW = 0;
    totalW = 0;

    ngAfterViewChecked() {
        this.idW = this.idText ? this.idText.nativeElement.getComputedTextLength() + this.padding : 0;
        this.modX = this.idW;
        this.modW = this.modText ? this.modText.nativeElement.getComputedTextLength() + this.padding : 0;
        this.argsW = this.argsText ? this.argsText.nativeElement.getComputedTextLength() + this.padding : 0;
        this.headW = this.headText ? this.headText.nativeElement.getComputedTextLength() : 0;
        this.headX = this.modX + this.modW;
        this.argsX =  this.headX + this.headW + this.padding;

        const mainW = (
            this.headText ?
            this.argsW + this.idW + this.headW + this.modW :
            0
        );

        const ruleW = this.ruleText ? this.ruleText.nativeElement.getComputedTextLength() : 0;
        this.totalW = Math.max(mainW, ruleW)

        this.onSize.emit({width: this.totalW, height: this.height});
    }

}
