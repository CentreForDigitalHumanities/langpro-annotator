import { Component, ChangeDetectionStrategy } from "@angular/core";
import { ToastService } from "../services/toast.service";
import { NgbToastModule } from "@ng-bootstrap/ng-bootstrap";

@Component({
    selector: "la-toast-container",
    templateUrl: "./toast-container.component.html",
    styleUrls: ["./toast-container.component.scss"],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [NgbToastModule]
})
export class ToastContainerComponent {
    constructor(public toastService: ToastService) {}
}
