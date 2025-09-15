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
import { Dataset, ProblemResponse } from "../../types";
import { faCheck, faExclamationCircle, faFloppyDisk, faTrash, faTree } from "@fortawesome/free-solid-svg-icons";
import { ProblemDetailsComponent } from "./problem-details/problem-details.component";
import { combineLatest, Subject } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { ProblemService } from "@/services/problem.service";
import { ParseService } from "@/services/parse.service";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { AppModeService } from "@/services/app-mode.service";
import { ToastService } from "@/services/toast.service";

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
        FontAwesomeModule,
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
    private appModeService = inject(AppModeService);
    private toastService = inject(ToastService);

    public form: ParseInputForm | null = null;
    public problem: ProblemResponse | null = null;

    public submit$ = new Subject<void>();

    public faCheck = faCheck;
    public faTree = faTree;
    public faFloppyDisk = faFloppyDisk;
    public faExclamationCircle = faExclamationCircle;
    public faTrash = faTrash;

    public showSaveButton$ = this.appModeService.adding$;

    public isUserProblem(problem: ProblemResponse | null): boolean {
        return problem?.problem?.dataset === Dataset.USER;
    }

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

        this.problemService.saveProblem$.pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe((response) => {
            if (response.error) {
                this.toastService.show({
                    header: $localize`Error`,
                    body: $localize`There was an error saving the problem: ${response.error}`,
                    type: 'danger'
                });
            }

            this.toastService.show({
                header: $localize`Problem saved`,
                body: $localize`Problem successfully saved to database.`,
                type: 'success'
            });
            this.router.navigate(["/", "annotate", response.id]);
        });

        // Subscription needed to ensure a request is actually made.
        // TODO: replace this with actual parse results.
        this.parseService.parse$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((response) => {
                console.log("Parse response:", response);
            });
    }

    public startParse(): void {
        if (!this.form || this.form.invalid) {
            return;
        }
        const input = this.form.getRawValue();
        this.parseService.submit.next(input);
    }

    public saveProblem(): void {
        if (!this.form || this.form.invalid) {
            return;
        }
        const input = this.form.getRawValue();
        this.problemService.submit$.next(input);
    }

    private navigateToNewProblem(problem: ProblemResponse | null): void {
        if (!problem?.problem) {
            return;
        }
        const incomingProblemId = problem?.id?.toString();
        const currentProblemId = this.route.snapshot.paramMap.get("problemId");

        if (incomingProblemId !== currentProblemId) {
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
