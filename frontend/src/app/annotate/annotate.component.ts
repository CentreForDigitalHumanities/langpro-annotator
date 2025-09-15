import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { AnnotationMenuComponent } from "./annotation-menu/annotation-menu.component";
import { NavigatorComponent } from "./navigator/navigator.component";
import { AnnotationInputComponent } from "./annotation-input/annotation-input.component";
import { SearchComponent } from "./search/search.component";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faBinoculars, faPlus } from "@fortawesome/free-solid-svg-icons";
import { ActivatedRoute, Router } from "@angular/router";
import { ProblemService } from "@/services/problem.service";
import { combineLatest, map, tap } from "rxjs";
import { CommonModule } from "@angular/common";
import { Dataset } from "@/types";
import { AppModeService } from "@/services/app-mode.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
    selector: "la-annotate",
    standalone: true,
    imports: [
        AnnotationMenuComponent,
        NavigatorComponent,
        AnnotationInputComponent,
        SearchComponent,
        FontAwesomeModule,
        CommonModule,
    ],
    templateUrl: "./annotate.component.html",
    styleUrl: "./annotate.component.scss",
})
export class AnnotateComponent implements OnInit {
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private problemService = inject(ProblemService);
    private appModeService = inject(AppModeService);
    private destroyRef = inject(DestroyRef);

    public faPlus = faPlus;
    public faBinoculars = faBinoculars;

    public viewMode$ = this.appModeService.viewMode$;
    public firstProblemId$ = this.problemService.firstProblemId$;

    public isUserProblem$ = this.problemService.problem$.pipe(
        map(problem => problem?.dataset === Dataset.USER)
    );

    ngOnInit(): void {
        const editParam$ = this.route.url.pipe(
            map(segments => segments.some(segment => segment.path === "edit"))
        );

        combineLatest([
            this.route.paramMap,
            this.route.queryParamMap,
            editParam$
        ])
            .pipe(
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(([params, queryParams, edit]) => {
                this.problemService.allParams$.next({ params, queryParams, edit });
            });
    }

    public goToProblem(problemId: string): void {
        this.router.navigate(["/", "annotate", problemId]);
    }

    public addProblem(): void {
        this.router.navigate(["/", "annotate", "new"]);
    }
}
