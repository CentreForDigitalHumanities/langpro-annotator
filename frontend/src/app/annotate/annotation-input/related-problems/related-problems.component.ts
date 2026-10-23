import { Problem, ProblemUsage, Sentence } from "@/types";
import { ChangeDetectionStrategy, Component, inject, input, OnDestroy } from "@angular/core";
import { ReusedProblemsModalComponent } from "../premises-form/reused-problems-modal/reused-problems-modal.component";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap/modal";

@Component({
    selector: "la-related-problems",
    standalone: true,
    templateUrl: "./related-problems.component.html",
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: "./related-problems.component.scss",
})
export class RelatedProblemsComponent implements OnDestroy {
    public currentProblem = input.required<Problem>();
    public sentence = input.required<Sentence>();

    private modalService = inject(NgbModal);
    private modalRef: NgbModalRef | null = null;

    public showReusedProblems(): void {
        this.modalRef = this.modalService.open(ReusedProblemsModalComponent, {
            centered: true,
            size: "md",
            scrollable: true,
            fullscreen: "sm-down",
        });

        this.modalRef.componentInstance.sentence = this.sentence();
        this.modalRef.componentInstance.currentlySelectedProblemId = this.currentProblem()?.id ?? null;

        this.modalRef.result.finally(() => {
            this.modalRef = null;
        });
    }

    public ngOnDestroy(): void {
        this.modalRef?.close();
    }
}

