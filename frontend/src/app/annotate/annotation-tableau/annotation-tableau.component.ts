import { Component } from "@angular/core";
import { TableauSVG } from "../tableau-svg/tableau-svg.component";

@Component({
    selector: "la-annotation-tableau",
    standalone: true,
    imports: [TableauSVG],
    templateUrl: "./annotation-tableau.component.html",
    styleUrl: "./annotation-tableau.component.scss",
})
export class AnnotationTableauComponent {}
