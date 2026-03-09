import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { mockResult } from "./mockParseResult";
import { ParseService } from "@/services/parse.service";
import { ParseTreeTableComponent } from "./parse-tree-table/parse-tree-table.component";
import { NgbAccordionModule } from "@ng-bootstrap/ng-bootstrap";


@Component({
    selector: "la-annotation-parse-results",
    standalone: true,
    imports: [ParseTreeTableComponent, NgbAccordionModule],
    templateUrl: "./annotation-parse-results.component.html",
    styleUrl: "./annotation-parse-results.component.scss",
})
export class AnnotationParseResultsComponent implements OnInit {
    private destroyRef = inject(DestroyRef);
    private parseService = inject(ParseService);

    public parseResults = mockResult;

    ngOnInit(): void {
        // Subscription needed to ensure a request is actually made.
        this.parseService.parse$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((response) => {
                console.log("Parse response:", response);
                this.parseResults = response.data.ccg_trees;
            });
    }
}
