import { Component, OnInit } from "@angular/core";
import {
    FormGroup,
    FormArray,
    FormControl,
    Validators,
    ReactiveFormsModule,
} from "@angular/forms";
import { CommonModule } from "@angular/common";
import { AnnotateService } from "../../../services/annotate.service";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faCheck, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";

@Component({
    selector: "la-premises-form",
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule, FontAwesomeModule],
    templateUrl: "./premises-form.component.html",
    styleUrl: "./premises-form.component.scss",
})
export class PremisesFormComponent implements OnInit {
    public form = new FormGroup({
        premises: new FormArray([
            new FormControl("", {
                nonNullable: true,
                validators: [Validators.required],
            }),
        ]),
        conclusion: new FormControl("", {
            nonNullable: true,
            validators: [Validators.required],
        }),
    });

    public faCheck = faCheck;
    public faPlus = faPlus;
    public faTrash = faTrash;

    get premises(): FormArray {
        return this.form.controls.premises;
    }

    constructor(private annotationService: AnnotateService) {}

    ngOnInit(): void {
        this.annotationService.getPremises().subscribe((data) => {
            this.setFormData(data);
        });
    }

    public addPremise(value: string = ""): void {
        this.premises.push(
            new FormControl(value, {
                nonNullable: true,
            })
        );
    }

    public removePremise(index: number): void {
        if (this.premises.length > 1) {
            this.premises.removeAt(index);
        }
    }

    public onSubmit(): void {
        console.log("submitting!");
    }

    private setFormData(data: {
        premises: string[];
        conclusion: string;
    }): void {
        this.premises.clear();
        data.premises.forEach((premise) => this.addPremise(premise));
        this.form.controls.conclusion.setValue(data.conclusion);
    }
}
