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
import { faCheck, faFloppyDisk, faTree } from "@fortawesome/free-solid-svg-icons";
import { ProblemDetailsComponent } from "./problem-details/problem-details.component";
import { combineLatest, Subject } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { ProblemService } from "@/services/problem.service";
import { ParseService } from "@/services/parse.service";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { AppModeService } from "@/services/app-mode.service";

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
    private destroyRef = inject(DestroyRef);
    private problemService = inject(ProblemService);
    private parseService = inject(ParseService);
    private appModeService = inject(AppModeService);
    private router = inject(Router);

    public form: ParseInputForm | null = null;
    public problem: ProblemResponse | null = null;

    public submit$ = new Subject<void>();

    public faCheck = faCheck;
    public faTree = faTree;
    public faFloppyDisk = faFloppyDisk;

    ngOnInit(): void {
        this.problemService.problem$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((problem) => {
                this.problem = problem;
                if (!problem) {
                    this.form = null;
                    return;
                }
                this.form = this.buildForm(problem);
            });

        this.problemService.saveProblem$.pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe((response) => {
            this.router.navigate(["/", "annotate", response.id]);
        });

        // Subscription needed to ensure a request is actually made.
        // TODO: replace this with actual parse results.
        this.parseService.parse$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((response) => {
                console.log("Parse response:", response);
            });

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

    public showSaveButton$ = this.appModeService.adding$;

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
