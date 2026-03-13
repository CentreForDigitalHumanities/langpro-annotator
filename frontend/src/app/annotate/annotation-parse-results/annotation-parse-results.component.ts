import { Component, DestroyRef, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ParseService } from "@/services/parse.service";
import { ParseTreeTableComponent } from "./parse-tree-table/parse-tree-table.component";
import { NgbAccordionModule } from "@ng-bootstrap/ng-bootstrap";
import { map } from "rxjs";
import { CommonModule } from "@angular/common";


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
            map(response => response?.data || null),
            takeUntilDestroyed(this.destroyRef)
        );
}
