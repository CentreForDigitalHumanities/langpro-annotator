import { Component } from "@angular/core";
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
import { Dataset, Judgement, ProblemResponse } from "../../types";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import {
    ProblemDetails,
    ProblemDetailsComponent,
} from "./problem-details/problem-details.component";
import { map, Subject } from "rxjs";

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

const judgementMap: Record<Dataset, Record<string, Judgement>> = {
    [Dataset.SICK]: {
        ENTAILMENT: Judgement.ENTAILMENT,
        CONTRADICTION: Judgement.CONTRADICTION,
        NEUTRAL: Judgement.NEUTRAL,
    },
    [Dataset.FRACAS]: {
        yes: Judgement.ENTAILMENT,
        no: Judgement.CONTRADICTION,
        unknown: Judgement.NEUTRAL,
        undefined: Judgement.UNKNOWN,
    },
    [Dataset.SNLI]: {
        entailment: Judgement.ENTAILMENT,
        contradiction: Judgement.CONTRADICTION,
        neutral: Judgement.NEUTRAL,
        none: Judgement.UNKNOWN,
    },
};

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
    public problem$ = this.annotateService.problem$;

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

        const { type, problem } = response;
        // Use the judgementMap to get the judgement based on the dataset and
        // the problem's entailment label or answer.
        // TODO: move this to the backend.
        const label =
            type === Dataset.SICK
                ? problem.entailmentLabel
                : type === Dataset.FRACAS
                ? problem.fracasAnswer
                : type === Dataset.SNLI
                ? problem.goldLabel
                : undefined;

        if (!label) {
            // If the label is not defined, we return UNKNOWN.
            return Judgement.UNKNOWN;
        }

        return judgementMap[response.type][label];
    }

    public faCheck = faCheck;

    constructor(private annotateService: AnnotateService) {}

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
        // TODO: move this to the backend.
        switch (problem.type) {
            case Dataset.SICK:
                return {
                    premises: [problem.problem.sentenceOne],
                    conclusion: problem.problem.sentenceTwo,
                };
            case Dataset.FRACAS:
                return {
                    premises: problem.problem.premises,
                    conclusion: problem.problem.hypothesis,
                };
            case Dataset.SNLI:
                return {
                    premises: [problem.problem.sentenceOne],
                    conclusion: problem.problem.sentenceTwo,
                };
        }
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
        switch (response.type) {
            case Dataset.SICK:
                return {
                    problemId: response.problem.pairId.toString(),
                    dataset: response.type,
                    judgement,
                    section: null,
                    subsection: null,
                    comment: null,
                };
            case Dataset.FRACAS:
                return {
                    problemId: response.problem.fracasId.toString(),
                    dataset: response.type,
                    judgement,
                    section: response.problem.sectionName,
                    subsection: response.problem.subsectionName,
                    comment: response.problem.note || null,
                };
            case Dataset.SNLI:
                return {
                    problemId: response.problem.pairId.toString(),
                    dataset: response.type,
                    judgement,
                    section: null,
                    subsection: null,
                    comment: null,
                };
        }
    }
}
