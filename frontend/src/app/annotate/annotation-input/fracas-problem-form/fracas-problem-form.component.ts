import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FracasProblem } from "../../../types";

@Component({
    selector: "la-fracas-problem-form",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./fracas-problem-form.component.html",
    styleUrl: "./fracas-problem-form.component.scss",
})
export class FracasProblemFormComponent {
    @Input({ required: true }) problem!: FracasProblem;
}
