import { Component, computed } from "@angular/core";
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

@Component({
    selector: "la-problem-details",
    standalone: true,
    imports: [JudgementBadgeComponent, FontAwesomeModule, NgbTooltipModule],
    templateUrl: "./problem-details.component.html",
    styleUrl: "./problem-details.component.scss",
})
export class ProblemDetailsComponent {
    constructor(private annotateService: AnnotateService) {}

    private problem = toSignal(this.annotateService.problem$);

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
        switch (response.type) {
            case Dataset.SICK:
                switch (response.problem.entailmentLabel) {
                    case "ENTAILMENT":
                        return Judgement.ENTAILMENT;
                    case "CONTRADICTION":
                        return Judgement.CONTRADICTION;
                    case "NEUTRAL":
                        return Judgement.NEUTRAL;
                }
            case Dataset.FRACAS:
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
            case Dataset.SNLI:
                switch (response.problem.goldLabel) {
                    case "entailment":
                        return Judgement.ENTAILMENT;
                    case "contradiction":
                        return Judgement.CONTRADICTION;
                    case "neutral":
                        return Judgement.NEUTRAL;
                    case "none":
                        return Judgement.UNKNOWN;
                }
        }
    }
}
