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
import { ActivatedRoute } from "@angular/router";
import { ProblemService } from "@/services/problem.service";
import { ParseService } from "@/services/parse.service";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faFloppyDisk, faRotateLeft } from "@fortawesome/free-solid-svg-icons";

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

export function kbForm(entity1: string, entity2: string, relationship: KnowledgeBaseRelationship) {
    return new FormGroup({
        "entity1": new FormControl<string>(entity1, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        "relationship": new FormControl<KnowledgeBaseRelationship>(
            relationship,
            {
                validators: [Validators.required],
                nonNullable: true,
            }
        ),
        "entity2": new FormControl<string>(entity2, {
            validators: [Validators.required],
            nonNullable: true,
        }),
    });

}

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
        FontAwesomeModule
    ],
    templateUrl: "./annotation-input.component.html",
    styleUrl: "./annotation-input.component.scss",
})
export class AnnotationInputComponent implements OnInit {
    public faFloppyDisk = faFloppyDisk;
    public faRotateLeft = faRotateLeft;

    private route = inject(ActivatedRoute);
    private destroyRef = inject(DestroyRef);
    private problemService = inject(ProblemService);
    private parseService = inject(ParseService);

    public form: ParseInputForm | null = null;
    public problem: ProblemResponse | null = null;

    public submit$ = new Subject<void>();

    public faCheck = faCheck;

    private problemId: number | null = null;
    private formValue: any;

    public modified = false;

    ngOnInit(): void {
        this.problemService.problem$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((problem) => {
                this.problem = problem;
                if (!problem) {
                    this.form = null;
                    return;
                }
                this.modified = false;
                this.form = this.buildForm(problem);
                this.formValue = this.form.value;
                this.form.valueChanges.subscribe(
                    data => {
                        // TODO: replace with more reasonable object compare
                        this.modified = JSON.stringify(this.formValue) != JSON.stringify(data)
                    }
                );
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
                this.problemId = parseInt(params.get('problemId')!, 10);
                this.problemService.allParams$.next({ params, queryParams });
            });
    }

    private buildForm(response: ProblemResponse): ParseInputForm {
        const premises = response.problem?.premises || [];
        const hypothesis = response.problem?.hypothesis || "";
        const annotations = response.problem?.annotation;
        const kbs = annotations?.kb ?? [];

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
            kbItems: new FormArray(
                kbs.map((kb: any) => kbForm(kb.entity1, kb.entity2, kb.relationship))
            ),
        });
    }

    saveChanges() {
        if (this.problemId) {
            let kb = [] as any[];
            this.form!.controls.kbItems.controls.forEach(kbRow => {
                kb.push({
                    entity1: kbRow.controls.entity1.value,
                    entity2: kbRow.controls.entity2.value,
                    relationship: kbRow.controls.relationship.value,
                });
            });
            this.problemService.save(this.problemId, {kb}).subscribe(result => {
                this.modified = false;
                this.formValue = this.form!.value;
            });
        }
    }

    revertChanges() {
        // TODO: cannot revert controls that were removed (e.g. knowledge base row)
        this.form?.reset();
    }
}
