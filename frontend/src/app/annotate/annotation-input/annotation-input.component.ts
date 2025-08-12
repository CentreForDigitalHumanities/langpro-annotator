import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
    FormArray,
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from "@angular/forms";
import { PremisesFormComponent } from "./premises-form/premises-form.component";
import {
    KnowledgeBaseFormComponent,
    KnowledgeBaseRelationship,
} from "./knowledge-base-form/knowledge-base-form.component";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ProblemResponse } from "../../types";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { ProblemDetailsComponent } from "./problem-details/problem-details.component";
import { combineLatest, Subject } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { ProblemService } from "@/services/problem.service";
import { ParseService } from "@/services/parse.service";

export type ParseInputForm = FormGroup<{
    premises: FormArray<FormControl<string>>;
    hypothesis: FormControl<string>;
    kbItems: FormArray<KnowledgeBaseItemsForm>;
}>;

type KnowledgeBaseItemsForm = FormGroup<{
    entity1: FormControl<string>;
    relationship: FormControl<KnowledgeBaseRelationship>;
    entity2: FormControl<string>;
}>;

export type ParseInput = ReturnType<ParseInputForm["getRawValue"]>;

@Component({
    selector: "la-annotation-input",
    standalone: true,
    imports: [
        CommonModule,
        PremisesFormComponent,
        KnowledgeBaseFormComponent,
        FormsModule,
        ReactiveFormsModule,
        ProblemDetailsComponent,
    ],
    templateUrl: "./annotation-input.component.html",
    styleUrl: "./annotation-input.component.scss",
})
export class AnnotationInputComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private destroyRef = inject(DestroyRef);
    private problemService = inject(ProblemService);
    private parseService = inject(ParseService);

    public form: ParseInputForm | null = null;
    public problem: ProblemResponse | null = null;

    public submit$ = new Subject<void>();

    public faCheck = faCheck;

    ngOnInit(): void {
        this.problemService.problem$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((problem) => {
                // Navigate away if the backend provides a new Problem ID.
                this.navigateToNewProblem(problem);

                // Otherwise, update local state and form.
                this.problem = problem;
                this.form = problem ? this.buildForm(problem) : null;
            });

        // Subscription needed to ensure a request is actually made.
        // TODO: replace this with actual parse results.
        this.parseService.parse$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((response) => {
                console.log("Parse response:", response);
            });

        // Listen to route changes only after subscribing to ProblemService.problem$.
        combineLatest([
            this.route.paramMap,
            this.route.queryParamMap])
            .pipe(
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(([params, queryParams]) => {
                this.problemService.allParams$.next({ params, queryParams });
            });
    }

    private navigateToNewProblem(problem: ProblemResponse | null): void {
        if (!problem) {
            return;
        }
        if (problem.id !== null && problem.id !== this.problem?.id) {
            this.router.navigate(['/annotate', problem.id], {
                queryParamsHandling: "preserve",
            });
        }

    }

    private buildForm(response: ProblemResponse): ParseInputForm {
        const premises = response.problem?.premises || [];
        const hypothesis = response.problem?.hypothesis || "";

        return new FormGroup({
            premises: new FormArray(
                premises.map(
                    (premise) =>
                        new FormControl<string>(premise, {
                            validators: [Validators.required],
                            nonNullable: true,
                        })
                )
            ),
            hypothesis: new FormControl<string>(hypothesis, {
                validators: [Validators.required],
                nonNullable: true,
            }),
            kbItems: new FormArray<KnowledgeBaseItemsForm>([]),
        });
    }
}
