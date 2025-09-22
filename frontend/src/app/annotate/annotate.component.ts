import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { AnnotationMenuComponent } from "./annotation-menu/annotation-menu.component";
import { NavigatorComponent } from "./navigator/navigator.component";
import { AnnotationInputComponent } from "./annotation-input/annotation-input.component";
import { SearchComponent } from "./search/search.component";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faBinoculars, faPlus } from "@fortawesome/free-solid-svg-icons";
import { ActivatedRoute, Router, ParamMap } from "@angular/router";
import { ProblemService } from "@/services/problem.service";
import { combineLatest, distinctUntilChanged, map } from "rxjs";
import { CommonModule } from "@angular/common";
import { Dataset } from "@/types";
import { AppModeService } from "@/services/app-mode.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { IconButtonComponent } from "@/shared/icon-button/icon-button.component";

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
        IconButtonComponent,
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
            map(segments => segments.some(segment => segment.path === "edit")),
            distinctUntilChanged(),
        );

        combineLatest([
            this.route.paramMap,
            this.route.queryParamMap,
            editParam$
        ])
            .pipe(
                distinctUntilChanged((oldParams, newParams) => this.areParamsEqual(oldParams, newParams)),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(([params, queryParams, edit]) => {
                this.problemService.allParams$.next({ params, queryParams, edit });
            });
    }

    public goToProblem(problemId: number): void {
        this.router.navigate(["/", "annotate", problemId.toString()]);
    }

    public addProblem(): void {
        this.router.navigate(["/", "annotate", "new"]);
    }

    private areParamsEqual(
        [oldParams, oldQueryParams, oldEditParam]: [ParamMap, ParamMap, boolean],
        [newParams, newQueryParams, newEditParam]: [ParamMap, ParamMap, boolean]
    ): boolean {
        const compareMaps = (map1: ParamMap, map2: ParamMap) => {
            if (map1.keys.length !== map2.keys.length) {
                return false;
            }
            return map1.keys.every((key: string) => map1.get(key) === map2.get(key));
        };

        return (
            compareMaps(oldParams, newParams) &&
            compareMaps(oldQueryParams, newQueryParams) &&
            oldEditParam === newEditParam
        );
    }
}
