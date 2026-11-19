import { Component, inject, ChangeDetectionStrategy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgbNavModule } from "@ng-bootstrap/ng-bootstrap";
import {
    faSquarePollHorizontal,
    faPenNib,
} from "@fortawesome/free-solid-svg-icons";

import { ParseService } from "@/services/parse.service";
import { AnnotationParseResultsComponent } from "../annotation-parse-results/annotation-parse-results.component";
import { TableauSVG } from '../tableau-svg/tableau-svg.component';
import { AnnotationListComponent } from "../../shared/annotation-list/annotation-list.component";
import { NoDataComponent } from "@/shared/no-data/no-data.component";
import { ProblemService } from "@/services/problem.service";
import { map, Observable } from "rxjs";
import { CombinedAnnotation } from "@/types";

@Component({
    selector: "la-annotation-menu",
    standalone: true,
    imports: [
        CommonModule,
        NgbNavModule,
        FontAwesomeModule,
        AnnotationParseResultsComponent,
        TableauSVG,
        AnnotationListComponent,
        NoDataComponent,
    ],
    templateUrl: "./annotation-menu.component.html",
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: "./annotation-menu.component.scss",
})
export class AnnotationMenuComponent {
    private problemService = inject(ProblemService);
    private parseService = inject(ParseService);
    public readonly proofs$ = this.parseService.proofs$;

    public problemAnnotations$: Observable<CombinedAnnotation[]> = this.problemService.problem$
        .pipe(
            map((problem) => {
                if (!problem) {
                    return [];
                }
                return [
                    ...problem.kbAnnotations,
                    ...problem.labelAnnotations,
                ];
            })
        );

    public active = 1;

    public faSquarePollHorizontal = faSquarePollHorizontal;
    public faPenNib = faPenNib;
}
