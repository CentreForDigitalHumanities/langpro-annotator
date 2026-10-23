import { Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Sentence } from "@/types";
import { datasetLabels } from "@/shared/displayTextMappings";

@Component({
    selector: "la-reused-problems-modal",
    standalone: true,
    imports: [RouterLink],
    templateUrl: "./reused-problems-modal.component.html",
})
export class ReusedProblemsModalComponent {
    public activeModal = inject(NgbActiveModal);

    public sentence: Sentence | null = null;
    public currentlySelectedProblemId: number | null = null;
    public datasetLabels = datasetLabels;
}
