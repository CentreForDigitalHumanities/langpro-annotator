import { Component, computed, input } from "@angular/core";
import { Dataset, Judgement, ProblemResponse } from "../../../types";
import { JudgementBadgeComponent } from "./judgement-badge/judgement-badge.component";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import { AnnotateService } from "../../../services/annotate.service";
import { toSignal } from "@angular/core/rxjs-interop";

export interface ProblemDetails {
    problemId: string;
    dataset: Dataset;
    judgement: Judgement;
    section: string | null;
    subsection: string | null;
    comment: string | null;
}

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
    selector: "la-problem-details",
    standalone: true,
    imports: [JudgementBadgeComponent, FontAwesomeModule, NgbTooltipModule],
    templateUrl: "./problem-details.component.html",
    styleUrl: "./problem-details.component.scss",
})
export class ProblemDetailsComponent {
    public readonly problem = input.required<ProblemResponse | null>();

    public problemDetails = computed(() => {
        const problem = this.problem();
        if (!problem) {
            return null;
        }
        return this.extractDetails(problem);
    });

    public faQuestionCircle = faQuestionCircle;

    public sectionString = computed<string | null>(() => {
        const problemDetails = this.problemDetails();
        if (!problemDetails) {
            return null;
        }
        const section = problemDetails.section;
        const subsection = problemDetails.subsection;
        if (section && subsection) {
            return `${section} | ${subsection}`;
        } else if (section) {
            return section;
        } else if (subsection) {
            return subsection;
        }
        return null;
    });

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
}
