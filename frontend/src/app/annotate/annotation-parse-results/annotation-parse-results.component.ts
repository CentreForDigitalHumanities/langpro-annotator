import { Component } from "@angular/core";
import { mockResult } from "./mockParseResult";
import { ParseTreeTableComponent } from "./parse-tree-table/parse-tree-table.component";
import { NgbAccordionModule } from "@ng-bootstrap/ng-bootstrap";


@Component({
    selector: "la-annotation-parse-results",
    standalone: true,
    imports: [ParseTreeTableComponent, NgbAccordionModule],
    templateUrl: "./annotation-parse-results.component.html",
    styleUrl: "./annotation-parse-results.component.scss",
})
export class AnnotationParseResultsComponent {
    public readonly parseResults = mockResult;
}
