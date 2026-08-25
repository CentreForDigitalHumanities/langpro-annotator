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
import { KnowledgeBaseFormComponent } from "./knowledge-base-form/knowledge-base-form.component";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { EntailmentLabel, KnowledgeBaseAnnotation, KnowledgeBaseRelationship, Problem } from "../../types";
import { faCheck, faExclamationCircle, faFloppyDisk, faHourglass, faTrash, faTree } from "@fortawesome/free-solid-svg-icons";
import { ProblemDetailsComponent } from "./problem-details/problem-details.component";
import { map, merge, Subject, takeUntil } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { ProblemService } from "@/services/problem.service";
import { ParseService } from "@/services/parse.service";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { ToastService } from "@/services/toast.service";
import { AuthService } from "@/services/auth.service";
import { IconButtonComponent } from "@/shared/icon-button/icon-button.component";
import { LangProPredictionComponent } from "./langpro-prediction/langpro-prediction.component";

export type ParseInputForm = FormGroup<{
    id: FormControl<number | null>;
    base: FormControl<number | null>;
    premises: FormArray<FormControl<string>>;
    hypothesis: FormControl<string>;
    kbItems: FormArray<KBItemForm>;
    langproPrediction: FormControl<EntailmentLabel | null>;
}>;


type KBItemForm = FormGroup<{
    id: FormControl<number | null>;
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
        IconButtonComponent,
        LangProPredictionComponent
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
    private toastService = inject(ToastService);
    private authService = inject(AuthService);

    public form: ParseInputForm | null = null;

    private formDestroy$ = new Subject<void>();

    public problem$ = this.problemService.problem$;

    public submit$ = new Subject<void>();

    public inProgress$ = this.parseService.inProgress$;

    public faCheck = faCheck;
    public faTree = faTree;
    public faFloppyDisk = faFloppyDisk;
    public faExclamationCircle = faExclamationCircle;
    public faTrash = faTrash;
    public faHourglass = faHourglass;

    public appMode$ = this.problemService.appMode$;

    public canEditProblem$ = this.authService.currentUser$.pipe(
        map(user => user?.canEditProblem ?? false)
    );

    ngOnInit(): void {
        this.problemService.problem$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((problem) => {
                // Navigate away if the backend provides a new Problem ID.
                this.navigateToNewProblem(problem);

                // Otherwise, update local form.
                this.formDestroy$.next();
                this.form = problem ? this.buildForm(problem) : null;
                if (this.form) {
                    this.emptyLangProPredictionUponChange(this.form);
                    this.markDirtyUponChange(this.form);
                }
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
                return;
            }

            this.toastService.show({
                header: $localize`Problem saved`,
                body: $localize`Problem successfully saved to database.`,
                type: 'success'
            });
            this.router.navigate(["/", "annotate", response.id]);
        });

        // Update the form with LangPro's prediction after a new parse result.
        this.parseService.parse$.pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe((parsedData) => {
            const incoming = parsedData?.data?.langpro_prediction ?? null;
            const current = this.form?.controls.langproPrediction.value ?? null;
            if (incoming && incoming !== current) {
                this.form?.controls.langproPrediction.setValue(incoming);
            }
        });
    }

    public startParse(): void {
        if (!this.form || this.form.invalid) {
            return;
        }
        const input = this.form.getRawValue();
        this.parseService.submit$.next(input);
    }

    public saveProblem(): void {
        this.form?.markAllAsTouched();
        if (!this.form || this.form.invalid) {
            return;
        }
        const input = this.form.getRawValue();
        this.problemService.submit$.next(input);
        this.form.markAsPristine();
    }

    private navigateToNewProblem(problem: Problem | null): void {
        if (!problem || !problem.id) {
            return;
        }
        const incomingProblemId = problem.id.toString();
        const currentProblemId = this.route.snapshot.paramMap.get("problemId");

        if (incomingProblemId !== currentProblemId) {
            this.router.navigate(['/annotate', problem.id], {
                queryParamsHandling: "preserve",
            });
        }
    }

    private buildForm(problem: Problem): ParseInputForm {
        const kbItems = this.buildKbForms(problem.kbAnnotations ?? []);

        return new FormGroup({
            id: new FormControl<number | null>(problem.id, {
                nonNullable: true
            }),
            base: new FormControl<number | null>(problem.base, {
                nonNullable: true
            }),
            premises: new FormArray(
                problem.premises.map(
                    (premise) =>
                        new FormControl<string>(premise, {
                            validators: [Validators.required],
                            nonNullable: true,
                        })
                )
            ),
            hypothesis: new FormControl<string>(problem.hypothesis ?? "", {
                validators: [Validators.required],
                nonNullable: true,
            }),
            kbItems: new FormArray<KBItemForm>(kbItems),
            langproPrediction: new FormControl<EntailmentLabel | null>(problem.langproPrediction, {
                nonNullable: true
            }),
        });
    }

    /**
     * Side effect: if the user changes the premises, hypothesis or KB items
     * of a problem, the langproPrediction field is emptied.
     */
    private emptyLangProPredictionUponChange(form: ParseInputForm): void {
        merge(
            form.controls.kbItems.valueChanges,
            form.controls.hypothesis.valueChanges,
            form.controls.premises.valueChanges,
        ).pipe(
            takeUntilDestroyed(this.destroyRef),
            takeUntil(this.formDestroy$),
        ).subscribe(() => {
            form.controls.langproPrediction.setValue(null, { emitEvent: false });
        });
    }

    private markDirtyUponChange(form: ParseInputForm): void {
        form.controls.langproPrediction.valueChanges
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                takeUntil(this.formDestroy$),
            ).subscribe(() => form.markAsDirty());
    }

    private buildKbForms(inputKbItems: KnowledgeBaseAnnotation[]): KBItemForm[] {
        return inputKbItems.map(item => new FormGroup({
            id: new FormControl<number | null>(item.id, {
                nonNullable: true
            }),
            entity1: new FormControl<string>(item.entity1, {
                nonNullable: true
            }),
            entity2: new FormControl<string>(item.entity2, {
                nonNullable: true
            }),
            relationship: new FormControl<KnowledgeBaseRelationship>(item.relationship, {
                nonNullable: true
            })
        }));
    }
}
