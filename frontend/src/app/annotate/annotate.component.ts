import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { AnnotationMenuComponent } from "./annotation-menu/annotation-menu.component";
import { NavigatorComponent } from "./navigator/navigator.component";
import { AnnotationInputComponent } from "./annotation-input/annotation-input.component";
import { SearchComponent } from "./search/search.component";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faBinoculars, faPlus } from "@fortawesome/free-solid-svg-icons";
import { ActivatedRoute, RouterLinkWithHref } from "@angular/router";
import { ProblemService } from "@/services/problem.service";
import { combineLatest, distinctUntilChanged, map } from "rxjs";
import { CommonModule } from "@angular/common";
import { Dataset } from "@/types";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AuthService } from "@/services/auth.service";
import areParamsEqual from "@/shared/areParamsEqual";

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
        RouterLinkWithHref,
    ],
    templateUrl: "./annotate.component.html",
    styleUrl: "./annotate.component.scss",
})
export class AnnotateComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private problemService = inject(ProblemService);
    private authService = inject(AuthService);
    private destroyRef = inject(DestroyRef);

    public faPlus = faPlus;
    public faBinoculars = faBinoculars;

    public appMode$ = this.problemService.appMode$;
    public firstProblemId$ = this.problemService.firstProblemId$;

    public isUserProblem$ = this.problemService.problem$.pipe(
        map(problem => problem?.dataset === Dataset.USER)
    );

    public canCreateProblem$ = this.authService.currentUser$.pipe(
        map(user => user?.canCreateProblem ?? false)
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
                distinctUntilChanged((oldParams, newParams) => areParamsEqual(oldParams, newParams)),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(([params, queryParams, edit]) => {
                this.problemService.allParams$.next({ params, queryParams, edit });
            });
    }
}
