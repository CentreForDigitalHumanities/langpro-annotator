import { Component, DestroyRef, OnInit } from "@angular/core";
import { AnnotationMenuComponent } from "./annotation-menu/annotation-menu.component";
import { NavigatorComponent } from "./navigator/navigator.component";
import { AnnotationInputComponent } from "./annotation-input/annotation-input.component";
import { ActivatedRoute } from "@angular/router";
import { AnnotateService } from "../services/annotate.service";
import { map } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { SearchComponent } from "./search/search.component";

@Component({
    selector: "la-annotate",
    standalone: true,
    imports: [
        AnnotationMenuComponent,
        NavigatorComponent,
        AnnotationInputComponent,
        SearchComponent,
    ],
    templateUrl: "./annotate.component.html",
    styleUrl: "./annotate.component.scss",
})
export class AnnotateComponent implements OnInit {
    constructor(
        private destroyRef: DestroyRef,
        private route: ActivatedRoute,
        private annotateService: AnnotateService
    ) {}

    ngOnInit(): void {
        this.route.params
            .pipe(
                map((params) => params["problemId"]),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((id) => {
                this.annotateService.problemId.next(id);
            });
    }
}
