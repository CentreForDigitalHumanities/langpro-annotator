import { Component } from "@angular/core";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgbNavModule } from "@ng-bootstrap/ng-bootstrap";
import {
    faKeyboard,
    faSquarePollHorizontal,
    faTree,
    faPenNib,
} from "@fortawesome/free-solid-svg-icons";
import { AnnotationInputComponent } from "../annotation-input/annotation-input.component";
import { AnnotationParseResultsComponent } from "../annotation-parse-results/annotation-parse-results.component";
import { AnnotationTableauComponent } from "../annotation-tableau/annotation-tableau.component";
import { AnnotationCommentsComponent } from "../annotation-comments/annotation-comments.component";

@Component({
    selector: "la-annotation-menu",
    standalone: true,
    imports: [
        NgbNavModule,
        FontAwesomeModule,
        AnnotationInputComponent,
        AnnotationParseResultsComponent,
        AnnotationTableauComponent,
        AnnotationCommentsComponent,
    ],
    templateUrl: "./annotation-menu.component.html",
    styleUrl: "./annotation-menu.component.scss",
})
export class AnnotationMenuComponent {
    public active = 1;

    public faKeyboard = faKeyboard;
    public faSquarePollHorizontal = faSquarePollHorizontal;
    public faTree = faTree;
    public faPenNib = faPenNib;
}
