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
import { AnnotateService } from "../../services/annotate.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ProblemResponse } from "../../types";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { ProblemDetailsComponent } from "./problem-details/problem-details.component";
import { map, Subject } from "rxjs";
import { ActivatedRoute } from "@angular/router";

export type AnnotationInputForm = FormGroup<{
    premises: FormArray<FormControl<string>>;
    hypothesis: FormControl<string>;
    kbItems: FormArray<KnowledgeBaseItemsForm>;
}>;

type KnowledgeBaseItemsForm = FormGroup<{
    entity1: FormControl<string>;
    relationship: FormControl<KnowledgeBaseRelationship>;
    entity2: FormControl<string>;
}>;

export type AnnotationInput = ReturnType<AnnotationInputForm["getRawValue"]>;

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
    private destroyRef = inject(DestroyRef);
    private annotateService = inject(AnnotateService);

    public form: AnnotationInputForm | null = null;
    public problem: ProblemResponse | null = null;

    public submit$ = new Subject<void>();

    public faCheck = faCheck;

    ngOnInit(): void {
        this.annotateService.problem$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((problem) => {
                this.problem = problem;
                if (!problem) {
                    this.form = null;
                    return;
                }
                this.form = this.buildForm(problem);
            });

        // Subscription needed to ensure a request is actually made.
        // TODO: replace this with actual parse results.
        this.annotateService.parse$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((response) => {
                console.log("Parse response:", response);
            });

        this.route.params
            .pipe(
                map((params) => params["problemId"]),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((id) => {
                this.annotateService.problemId.next(id);
            });
    }

    private buildForm(response: ProblemResponse): AnnotationInputForm {
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
