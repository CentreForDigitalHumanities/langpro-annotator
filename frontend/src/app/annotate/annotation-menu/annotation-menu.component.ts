import { Component } from "@angular/core";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgbNavModule } from "@ng-bootstrap/ng-bootstrap";
import {
    faSquarePollHorizontal,
    faTree,
    faPenNib,
} from "@fortawesome/free-solid-svg-icons";
import { AnnotationParseResultsComponent } from "../annotation-parse-results/annotation-parse-results.component";
import { TableauSVG } from '../tableau-svg/tableau-svg.component';
import { AnnotationCommentsComponent } from "../annotation-comments/annotation-comments.component";

@Component({
    selector: "la-annotation-menu",
    standalone: true,
    imports: [
        NgbNavModule,
        FontAwesomeModule,
        AnnotationParseResultsComponent,
        TableauSVG,
        AnnotationCommentsComponent,
    ],
    templateUrl: "./annotation-menu.component.html",
    styleUrl: "./annotation-menu.component.scss",
})
export class AnnotationMenuComponent {
    public active = 1;

    public faSquarePollHorizontal = faSquarePollHorizontal;
    public faTree = faTree;
    public faPenNib = faPenNib;
}
