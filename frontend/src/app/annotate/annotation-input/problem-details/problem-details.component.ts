import { Dataset, EntailmentLabel, LabelAnnotation, Problem } from "../../../types";
import { Component, computed, inject, input } from "@angular/core";
import { EntailmentLabelBadgeComponent } from "./entailment-label-badge/entailment-label-badge.component";
import { faArrowUpRightFromSquare, faCircleInfo, faEyeSlash, faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgbModal, NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import { datasetLabels } from "@/shared/displayTextMappings";
import { ProblemLabelsComponent } from "./problem-labels/problem-labels.component";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { ProblemService } from "@/services/problem.service";
import { AuthService } from "@/services/auth.service";
import { VisibilityToggleComponent } from "./visibility-toggle/visibility-toggle.component";
import { GoldToggleComponent } from "./gold-toggle/gold-toggle.component";
import { StatusBadgeComponent } from "./status-badge/status-badge.component";
import { StatusInfoModalComponent } from "@/annotate/search/status-info-modal/status-info-modal.component";

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
        StatusBadgeComponent,
    ],
    templateUrl: "./problem-details.component.html",
    styleUrl: "./problem-details.component.scss",
})
export class ProblemDetailsComponent {
    public readonly problem = input.required<Problem>();
    private problemService = inject(ProblemService);
    private authService = inject(AuthService);
    private modalService = inject(NgbModal);

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
    public faEyeSlash = faEyeSlash;
    public faArrowUpRight = faArrowUpRightFromSquare;
    public datasetLabels = datasetLabels;
    public faCircleInfo = faCircleInfo;

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

    public showStatusInfoModal(): void {
        this.modalService.open(StatusInfoModalComponent, {
            centered: true,
        });
    }

    private extractDetails(problem: Problem): ProblemDetails | null {
        const shared: Pick<
            ProblemDetails,
            "problemId" | "dataset" | "entailmentLabel" | "labelAnnotations" | "baseProblemId"
        > = {
            problemId: problem.id?.toString() ?? $localize`new`,
            baseProblemId: problem.base?.toString() ?? null,
            dataset: problem.dataset,
            entailmentLabel: problem.entailmentLabel,
            labelAnnotations: problem.labelAnnotations.filter(a => a.removedAt === null) ?? [],
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
