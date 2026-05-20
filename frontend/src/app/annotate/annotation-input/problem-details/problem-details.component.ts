import { Dataset, EntailmentLabel, LabelAnnotation, Problem, ProblemStatus } from "../../../types";
import { Component, computed, inject, input } from "@angular/core";
import { EntailmentLabelBadgeComponent } from "./entailment-label-badge/entailment-label-badge.component";
import { faArrowUpRightFromSquare, faMedal, faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import { datasetLabels, statusLabels } from "@/shared/displayTextMappings";
import { ProblemLabelsComponent } from "./problem-labels/problem-labels.component";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { ProblemService } from "@/services/problem.service";
import { AuthService } from "@/services/auth.service";
import { VisibilityToggleComponent } from "./visibility-toggle/visibility-toggle.component";
import { GoldToggleComponent } from "./gold-toggle.component";

export interface ProblemDetails {
    problemId: string;
    baseProblemId: string | null;
    dataset: Dataset;
    entailmentLabel: EntailmentLabel;
    section: string | null;
    subsection: string | null;
    comment: string | null;
    labelAnnotations: LabelAnnotation[];
}

@Component({
    selector: "la-problem-details",
    standalone: true,
    imports: [
        EntailmentLabelBadgeComponent,
        ProblemLabelsComponent,
        FontAwesomeModule,
        NgbTooltipModule,
        CommonModule,
        RouterModule,
        VisibilityToggleComponent,
        GoldToggleComponent,
    ],
    templateUrl: "./problem-details.component.html",
    styleUrl: "./problem-details.component.scss",
})
export class ProblemDetailsComponent {
    public readonly problem = input.required<Problem>();
    private problemService = inject(ProblemService);
    private authService = inject(AuthService);

    public appMode$ = this.problemService.appMode$;
    public currentUser$ = this.authService.currentUser$;

    public problemDetails = computed(() => {
        const problem = this.problem();
        if (!problem) {
            return null;
        }
        return this.extractDetails(problem);
    });

    public faQuestionCircle = faQuestionCircle;
    public faArrowUpRight = faArrowUpRightFromSquare;
    public faMedal = faMedal;
    public datasetLabels = datasetLabels;
    public statusLabels = statusLabels;
    public ProblemStatus = ProblemStatus;

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
            "problemId" | "dataset" | "entailmentLabel" | "labelAnnotations" | "baseProblemId"
        > = {
            problemId: problem.id?.toString() ?? $localize`new`,
            baseProblemId: problem.base?.toString() ?? null,
            dataset: problem.dataset,
            entailmentLabel: problem.entailmentLabel,
            labelAnnotations: problem.labelAnnotations ?? [],
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
