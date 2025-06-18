import { Component, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
    FormArray,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from "@angular/forms";
import {
    Premises,
    PremisesFormComponent,
} from "./premises-form/premises-form.component";
import {
    KnowledgeBaseFormComponent,
    KnowledgeBaseRelationship,
} from "./knowledge-base-form/knowledge-base-form.component";
import { AnnotateService } from "../../services/annotate.service";
import { toSignal } from "@angular/core/rxjs-interop";
import { Judgement, ProblemResponse } from "../../types";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import {
    ProblemDetails,
    ProblemDetailsComponent,
} from "./problem-details/problem-details.component";
import { ActivatedRoute } from "@angular/router";
import { map, Subject, switchMap } from "rxjs";

type KnowledgeBaseItemsForm = FormGroup<{
    entity1: FormControl<string>;
    relationship: FormControl<KnowledgeBaseRelationship>;
    entity2: FormControl<string>;
}>;

export type AnnotationInputForm = FormGroup<{
    premises: FormArray<FormControl<string>>;
    conclusion: FormControl<string>;
    kbItems: FormArray<KnowledgeBaseItemsForm>;
}>;

@Component({
    selector: "la-annotation-input",
    standalone: true,
    imports: [
        CommonModule,
        PremisesFormComponent,
        KnowledgeBaseFormComponent,
        ReactiveFormsModule,
        FontAwesomeModule,
        ProblemDetailsComponent,
    ],
    templateUrl: "./annotation-input.component.html",
    styleUrl: "./annotation-input.component.scss",
})
export class AnnotationInputComponent {
    private problem$ = this.route.params.pipe(
        map((params) => params["problemId"]),
        switchMap((problemId) => this.annotateService.problem$(problemId))
    );

    public form$ = this.problem$.pipe(
        map((response) => this.buildForm(response))
    );

    private formSignal = toSignal(this.form$, {
        initialValue: null,
    });

    public problemDetails$ = this.problem$.pipe(
        map((response) => this.extractDetails(response))
    );

    public submit$ = new Subject<void>();

    private getJudgement(response: ProblemResponse): Judgement {
        // This should never happen, as we check for a problem in the calling
        // function, but TypeScript does not know this.
        if (!response.problem) {
            return Judgement.UNKNOWN;
        }
        if (response.type === "sick") {
            switch (response.problem.entailmentLabel) {
                case "ENTAILMENT":
                    return Judgement.ENTAILMENT;
                case "CONTRADICTION":
                    return Judgement.CONTRADICTION;
                case "NEUTRAL":
                    return Judgement.NEUTRAL;
            }
        }
        // FraCaS
        switch (response.problem.fracasAnswer) {
            case "yes":
                return Judgement.ENTAILMENT;
            case "no":
                return Judgement.CONTRADICTION;
            case "unknown":
                return Judgement.NEUTRAL;
            case "undefined":
                return Judgement.UNKNOWN;
        }
    }

    public faCheck = faCheck;

    constructor(
        private annotateService: AnnotateService,
        private route: ActivatedRoute
    ) {}

    public onSubmit(): void {
        const form = this.formSignal();
        if (!form) {
            return;
        }
        if (form.valid) {
            console.log(
                "submitting from AnnotationInputComponent!",
                form.value
            );
        }
    }

    private getPremisesAndConclusion(problem: ProblemResponse): Premises {
        if (!problem.problem || !problem.type) {
            return {
                premises: [],
                conclusion: "",
            };
        }

        if (problem.type === "sick") {
            return {
                premises: [problem.problem.sentenceOne],
                conclusion: problem.problem.sentenceTwo,
            };
        }

        // FraCaS
        return {
            premises: problem.problem.premises,
            conclusion: problem.problem.hypothesis,
        };
    }

    private buildForm(
        response: ProblemResponse | null
    ): AnnotationInputForm | null {
        if (!response) {
            return null;
        }

        const { premises, conclusion } =
            this.getPremisesAndConclusion(response);
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
            conclusion: new FormControl<string>(conclusion, {
                validators: [Validators.required],
                nonNullable: true,
            }),
            kbItems: new FormArray<KnowledgeBaseItemsForm>([]),
        });
    }

    private extractDetails(
        response: ProblemResponse | null
    ): ProblemDetails | null {
        if (!response?.problem) {
            return null;
        }
        const judgement = this.getJudgement(response);
        if (response.type === "sick") {
            return {
                problemId: response.problem.pairId.toString(),
                dataset: response.type,
                judgement,
                section: null,
                subsection: null,
                comment: null,
            };
        }
        // FraCaS
        return {
            problemId: response.problem.fracasId.toString(),
            dataset: response.type,
            judgement,
            section: response.problem.sectionName,
            subsection: response.problem.subsectionName,
            comment: response.problem.note || null,
        };
    }
}
