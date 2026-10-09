import { Component, inject, input, OnDestroy } from "@angular/core";
import { ReactiveFormsModule, FormControl, Validators } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { ParseInputForm } from "../annotation-input.component";
import { ProblemService } from "@/services/problem.service";
import { IconButtonComponent } from "@/shared/icon-button/icon-button.component";
import { Problem, ProblemUsage } from "@/types";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { ReusedProblemsModalComponent } from "./reused-problems-modal/reused-problems-modal.component";

export interface Premises {
    premises: string[];
    hypothesis: string;
}

@Component({
    selector: "la-premises-form",
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule, FontAwesomeModule, IconButtonComponent],
    templateUrl: "./premises-form.component.html",
    styleUrl: "./premises-form.component.scss",
})
export class PremisesFormComponent implements OnDestroy {
    private problemService = inject(ProblemService);
    private modalService = inject(NgbModal);

    public form = input.required<ParseInputForm>();
    public problem = input<Problem | null>(null);

    public faPlus = faPlus;
    public faTrash = faTrash;

    public appMode$ = this.problemService.appMode$;

    private modalRef: NgbModalRef | null = null;

    public showReusedProblems(problems: ProblemUsage[], sentence: string): void {
        this.modalRef = this.modalService.open(ReusedProblemsModalComponent, {
            centered: true,
            size: "md",
            scrollable: true,
            fullscreen: "sm-down",
        });

        this.modalRef.componentInstance.problems = problems;
        this.modalRef.componentInstance.sentence = sentence;
        this.modalRef.componentInstance.currentlySelectedProblemId = this.problem()?.id ?? null;

        this.modalRef.result.finally(() => {
            this.modalRef = null;
        });
    }

    public addPremise(value: string = ""): void {
        const premisesArray = this.form().controls.premises;
        premisesArray.push(
            new FormControl(value, {
                nonNullable: true,
                validators: [Validators.required],
            }),
        );
    }

    public removePremise(index: number): void {
        this.form().controls.premises.removeAt(index);
    }

    public ngOnDestroy(): void {
        this.modalRef?.close();
    }
}
