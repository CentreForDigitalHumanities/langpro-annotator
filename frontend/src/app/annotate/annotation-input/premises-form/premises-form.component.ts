import { Component, input } from "@angular/core";
import {
    ReactiveFormsModule,
    FormControl,
    Validators,
} from "@angular/forms";
import { CommonModule } from "@angular/common";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faCheck, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { AnnotationInputForm } from "../annotation-input.component";

export interface Premises {
    premises: string[];
    conclusion: string;
}

@Component({
    selector: "la-premises-form",
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule, FontAwesomeModule],
    templateUrl: "./premises-form.component.html",
    styleUrl: "./premises-form.component.scss",
})
export class PremisesFormComponent {
    public form = input.required<AnnotationInputForm>();

    public faCheck = faCheck;
    public faPlus = faPlus;
    public faTrash = faTrash;

    constructor() {}

    public addPremise(value: string = ""): void {
        const premisesArray = this.form().controls.premises;
        premisesArray.push(
            new FormControl(value, {
                nonNullable: true,
                validators: [Validators.required],
            })
        );
    }

    public removePremise(index: number): void {
        const premisesArray = this.form().controls.premises;
        if (premisesArray.length > 1) {
            premisesArray.removeAt(index);
        }
    }
}
