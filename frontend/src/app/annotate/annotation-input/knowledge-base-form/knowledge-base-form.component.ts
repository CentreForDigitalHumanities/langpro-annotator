import { Component } from "@angular/core";
import { FormArray, FormGroup, Validators, FormControl } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faCheck, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";

const KnowledgeBaseRelationships = [
    "EQUAL",
    "NOT_EQUAL",
    "SUBSET",
    "SUPERSET",
] as const;

type KnowledgeBaseRelationship = typeof KnowledgeBaseRelationships[number];

const relationshipDisplayMapping: Record<KnowledgeBaseRelationship, string> = {
    EQUAL: "is equal to",
    NOT_EQUAL: "is not equal to",
    SUBSET: "is a subset of",
    SUPERSET: "is a superset of",
};

interface KnowledgeBaseForm {
    entity1: FormControl<string>;
    relationship: FormControl<KnowledgeBaseRelationship>;
    entity2: FormControl<string>;
}

@Component({
    selector: "la-knowledge-base-form",
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
    templateUrl: "./knowledge-base-form.component.html",
    styleUrls: ["./knowledge-base-form.component.scss"],
})
export class KnowledgeBaseFormComponent {
    public form = new FormGroup({
        kbItems: new FormArray([
            new FormGroup<KnowledgeBaseForm>({
                entity1: new FormControl<string>("", {
                    validators: [Validators.required],
                    nonNullable: true,
                }),
                relationship: new FormControl<KnowledgeBaseRelationship>(
                    "EQUAL",
                    {
                        validators: [Validators.required],
                        nonNullable: true,
                    }
                ),
                entity2: new FormControl<string>("", {
                    validators: [Validators.required],
                    nonNullable: true,
                }),
            }),
        ]),
    });

    public relationshipTypes = KnowledgeBaseRelationships;

    public faCheck = faCheck;
    public faPlus = faPlus;
    public faTrash = faTrash;

    constructor() {}

    public addKnowledgeBaseItem(): void {
        const newItem = new FormGroup<KnowledgeBaseForm>({
            entity1: new FormControl<string>("", {
                validators: [Validators.required],
                nonNullable: true,
            }),
            relationship: new FormControl<KnowledgeBaseRelationship>("EQUAL", {
                validators: [Validators.required],
                nonNullable: true,
            }),
            entity2: new FormControl<string>("", {
                validators: [Validators.required],
                nonNullable: true,
            }),
        });
        this.form.controls.kbItems.push(newItem);
    }

    public getRelationshipTypeName(
        relationship: KnowledgeBaseRelationship
    ): string {
        return relationshipDisplayMapping[relationship];
    }

    public removeKnowledgeBaseItem(index: number): void {
        if (this.form.controls.kbItems.length > 1) {
            this.form.controls.kbItems.removeAt(index);
        }
    }

    public onSubmit(): void {
        if (this.form.valid) {
            console.log("Submitting:", this.form.value);
        }
    }
}
