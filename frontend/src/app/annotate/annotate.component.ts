import { Component, inject } from "@angular/core";
import { AnnotationMenuComponent } from "./annotation-menu/annotation-menu.component";
import { NavigatorComponent } from "./navigator/navigator.component";
import { AnnotationInputComponent } from "./annotation-input/annotation-input.component";
import { SearchComponent } from "./search/search.component";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { Router } from "@angular/router";
import { ProblemService } from "@/services/problem.service";
import { map } from "rxjs";
import { CommonModule } from "@angular/common";
import { Dataset } from "@/types";
import { AppModeService } from "@/services/app-mode.service";

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
export class AnnotateComponent {
    private router = inject(Router);
    private problemService = inject(ProblemService);
    private appModeService = inject(AppModeService);
    public faPlus = faPlus;

    public browsing$ = this.appModeService.browsing$;
    public adding$ = this.appModeService.adding$;
    public editing$ = this.appModeService.editing$;

    public firstProblemId$ = this.problemService.proofBankStats$.pipe(
        map((stats) => stats?.firstProblemId ?? null),
    );

    public isUserProblem$ = this.problemService.problem$.pipe(
        map(problem => problem?.problem?.dataset === Dataset.USER)
    );

    public goToProblem(problemId: string): void {
        this.router.navigate(["/", "annotate", problemId]);
    }

    public addProblem(): void {
        this.router.navigate(["/", "annotate", "new"]);
    }
}
