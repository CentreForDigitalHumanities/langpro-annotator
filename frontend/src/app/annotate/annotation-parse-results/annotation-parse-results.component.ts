import { Component, DestroyRef, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ParseService } from "@/services/parse.service";
import { ParseTreeTableComponent } from "./parse-tree-table/parse-tree-table.component";
import { NgbAccordionModule } from "@ng-bootstrap/ng-bootstrap";
import { map } from "rxjs";
import { CommonModule } from "@angular/common";
import { CCGNode, CCGParse } from "@/types";

export interface TreeWithType {
    type: string;
    tree: CCGNode;
}

interface UnfoldedParseResult {
    sentence: string;
    ccgTrees: TreeWithType[];
}

function unfoldParseResult(parse: CCGParse): UnfoldedParseResult {
    const { ccg_tree, ccg_term, corr_term, llf } = parse.ccg_trees;
    // TODO: Reintroduce the other trees once they are serialized properly.
    return {
        ...parse,
        ccgTrees: [
            { type: "CCG Tree", tree: ccg_tree },
            { type: "CCG Term", tree: ccg_term },
            { type: "Corrected CCG Term", tree: corr_term },
            { type: "Lambda Logical Form", tree: llf }
        ]
    };
}


@Component({
    selector: "la-annotation-parse-results",
    standalone: true,
    imports: [ParseTreeTableComponent, NgbAccordionModule, CommonModule],
    templateUrl: "./annotation-parse-results.component.html",
    styleUrl: "./annotation-parse-results.component.scss",
})
export class AnnotationParseResultsComponent {
    private destroyRef = inject(DestroyRef);
    private parseService = inject(ParseService);

    public parseResults$ = this.parseService.parse$
        .pipe(
            map(response => response?.data?.ccg_parses.map(parse => unfoldParseResult(parse)) ?? null),
            takeUntilDestroyed(this.destroyRef)
        );
}
