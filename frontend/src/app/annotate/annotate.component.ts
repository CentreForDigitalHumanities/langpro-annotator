import { Component } from "@angular/core";
import { AnnotationMenuComponent } from "./annotation-menu/annotation-menu.component";
import { NavigatorComponent } from "./navigator/navigator.component";

@Component({
    selector: "la-annotate",
    standalone: true,
    imports: [AnnotationMenuComponent, NavigatorComponent],
    templateUrl: "./annotate.component.html",
    styleUrl: "./annotate.component.scss",
})
export class AnnotateComponent {}
