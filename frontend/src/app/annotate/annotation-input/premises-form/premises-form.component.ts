import { Component, inject, input } from "@angular/core";
import { ReactiveFormsModule, FormControl, Validators } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { ParseInputForm } from "../annotation-input.component";
import { IconButtonComponent } from "@/shared/icon-button/icon-button.component";
import { ProblemService } from "@/services/problem.service";

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
export class PremisesFormComponent {
    private problemService = inject(ProblemService);

    public form = input.required<ParseInputForm>();

    public faPlus = faPlus;
    public faTrash = faTrash;

    public appMode$ = this.problemService.appMode$;

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
}
