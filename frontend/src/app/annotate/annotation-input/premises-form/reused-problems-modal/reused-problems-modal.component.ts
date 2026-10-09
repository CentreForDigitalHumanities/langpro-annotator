import { Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
    selector: "la-reused-problems-modal",
    standalone: true,
    imports: [RouterLink],
    templateUrl: "./reused-problems-modal.component.html",
})
export class ReusedProblemsModalComponent {
    public activeModal = inject(NgbActiveModal);

    public sentence: string | null = null;
    public problemIds: number[] = [];
}
