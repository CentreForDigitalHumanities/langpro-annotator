import { Component, inject, ChangeDetectionStrategy, DestroyRef, OnInit } from "@angular/core";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
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
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
    selector: "la-navigator",
    standalone: true,
    imports: [FontAwesomeModule, CommonModule, RouterLinkWithHref, ReactiveFormsModule],
    templateUrl: "./navigator.component.html",
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: "./navigator.component.scss",
})
export class NavigatorComponent implements OnInit {
    private problemService = inject(ProblemService);
    private router = inject(Router);
    private destroyRef = inject(DestroyRef);

    public problemResponse$ = this.problemService.problemResponse$;

    public id = new FormControl<number | null>(null, {
        nonNullable: true, validators: [
            Validators.min(1),
        ]
    });

    public faAnglesLeft = faAnglesLeft;
    public faAnglesRight = faAnglesRight;
    public faAngleLeft = faAngleLeft;
    public faAngleRight = faAngleRight;
    public faQuestion = faQuestion;

    public ngOnInit(): void {
        this.problemResponse$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((problemResponse) => {
                if (problemResponse?.problem) {
                    this.id.reset();
                }
            });
    }

    public jumpToId(event: Event): void {
        event.preventDefault();
        this.id.updateValueAndValidity();
        if (this.id.invalid) {
            return;
        }
        const problemId = this.id.value;
        void this.router.navigate(["/", "annotate", problemId]);
    }
}
