import { Component, computed, input } from "@angular/core";
import { Dataset, EntailmentLabel, Problem } from "../../../types";
import { EntailmentLabelBadgeComponent } from "./entailment-label-badge/entailment-label-badge.component";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import { datasetLabels } from "@/shared/displayTextMappings";

export interface ProblemDetails {
    problemId: string;
    dataset: Dataset;
    entailmentLabel: EntailmentLabel;
    section: string | null;
    subsection: string | null;
    comment: string | null;
}

@Component({
    selector: "la-problem-details",
    standalone: true,
    imports: [
        EntailmentLabelBadgeComponent,
        FontAwesomeModule,
        NgbTooltipModule,
    ],
    templateUrl: "./problem-details.component.html",
    styleUrl: "./problem-details.component.scss",
})
export class ProblemDetailsComponent {
    public readonly problem = input.required<Problem>();

    public problemDetails = computed(() => {
        const problem = this.problem();
        if (!problem) {
            return null;
        }
        return this.extractDetails(problem);
    });

    public faQuestionCircle = faQuestionCircle;
    public datasetLabels = datasetLabels;

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

    private extractDetails(problem: Problem): ProblemDetails | null {
        const shared: Pick<
            ProblemDetails,
            "problemId" | "dataset" | "entailmentLabel"
        > = {
            problemId: problem.id?.toString() ?? $localize`new`,
            dataset: problem.dataset,
            entailmentLabel: problem.entailmentLabel,
        };

        switch (problem.dataset) {
            case Dataset.SICK:
                return {
                    ...shared,
                    section: null,
                    subsection: null,
                    comment: null,
                };
            case Dataset.FRACAS:
                return {
                    ...shared,
                    section: problem.extraData.sectionName,
                    subsection: problem.extraData.subsectionName,
                    comment: problem.extraData.note || null,
                };
            case Dataset.SNLI:
                return {
                    ...shared,
                    section: null,
                    subsection: null,
                    comment: null,
                };
            case Dataset.USER:
                return {
                    ...shared,
                    section: null,
                    subsection: null,
                    comment: null,
                };
        }
    }
}
