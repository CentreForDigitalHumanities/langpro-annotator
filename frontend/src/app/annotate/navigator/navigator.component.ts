import { Component, inject } from "@angular/core";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import {
    faAngleLeft,
    faAngleRight,
    faAnglesLeft,
    faAnglesRight,
    faQuestion,
} from "@fortawesome/free-solid-svg-icons";
import { CommonModule } from "@angular/common";
import { Router, RouterLinkWithHref } from "@angular/router";
import { ProblemService } from "@/services/problem.service";

@Component({
    selector: "la-navigator",
    standalone: true,
    imports: [FontAwesomeModule, CommonModule, RouterLinkWithHref, ReactiveFormsModule],
    templateUrl: "./navigator.component.html",
    styleUrl: "./navigator.component.scss",
})
export class NavigatorComponent {
    private problemService = inject(ProblemService);
    private router = inject(Router);

    public problemResponse$ = this.problemService.problemResponse$;

    public id = new FormControl<number | null>(null, { nonNullable: true });

    public faAnglesLeft = faAnglesLeft;
    public faAnglesRight = faAnglesRight;
    public faAngleLeft = faAngleLeft;
    public faAngleRight = faAngleRight;
    public faQuestion = faQuestion;

    public jumpToId(): void {
        const problemId = this.id.value;
        if (!problemId || !Number.isSafeInteger(problemId) || problemId < 1) {
            return;
        }

        void this.router.navigate(["/", "annotate", problemId]);
    }
}
