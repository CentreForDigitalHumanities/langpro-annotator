import { Component, inject } from "@angular/core";
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
import { AnnotationCommentsComponent } from "../annotation-comments/annotation-comments.component";
import { NoDataComponent } from "@/shared/no-data/no-data.component";

@Component({
    selector: "la-annotation-menu",
    standalone: true,
    imports: [
        CommonModule,
        NgbNavModule,
        FontAwesomeModule,
        AnnotationParseResultsComponent,
        TableauSVG,
        AnnotationCommentsComponent,
        NoDataComponent,
    ],
    templateUrl: "./annotation-menu.component.html",
    styleUrl: "./annotation-menu.component.scss",
})
export class AnnotationMenuComponent {
    private parseService = inject(ParseService);
    public readonly proofs$ = this.parseService.proofs$;

    public active = 1;

    public faSquarePollHorizontal = faSquarePollHorizontal;
    public faPenNib = faPenNib;
}
