import { Component, computed, input } from "@angular/core";
import { Dataset, Judgement } from "../../../types";
import { JudgementBadgeComponent } from "./judgement-badge/judgement-badge.component";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";

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
    public problemDetails = input.required<ProblemDetails>();

    public faQuestionCircle = faQuestionCircle;

    public sectionString = computed<string | null>(() => {
        const problemDetails = this.problemDetails();
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
}
