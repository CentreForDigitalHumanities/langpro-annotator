import { Component, Input } from "@angular/core";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgbNavModule } from "@ng-bootstrap/ng-bootstrap";
import {
    faSquarePollHorizontal,
    faTree,
    faPenNib,
} from "@fortawesome/free-solid-svg-icons";
import { AnnotationTableauComponent } from "../annotation-tableau/annotation-tableau.component";
import { AnnotationCommentsComponent } from "../annotation-comments/annotation-comments.component";
import { ParseSVG } from "../parse-tree/parse-svg.component";

@Component({
    selector: "la-annotation-menu",
    standalone: true,
    imports: [
        NgbNavModule,
        FontAwesomeModule,
        AnnotationTableauComponent,
        AnnotationCommentsComponent,
        ParseSVG
    ],
    templateUrl: "./annotation-menu.component.html",
    styleUrl: "./annotation-menu.component.scss",
})
export class AnnotationMenuComponent {
    public active = 1;

    public faSquarePollHorizontal = faSquarePollHorizontal;
    public faTree = faTree;
    public faPenNib = faPenNib;

    @Input()
    public ccgTrees: any[] = [];
}
