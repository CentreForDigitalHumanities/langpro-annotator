import { Component, input } from "@angular/core";
import { FormGroup, Validators, FormControl } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { ParseInputForm, kbForm } from "../annotation-input.component";

export enum KnowledgeBaseRelationship {
    EQUAL = "EQUAL",
    NOT_EQUAL = "NOT_EQUAL",
    SUBSET = "SUBSET",
    SUPERSET = "SUPERSET",
}

const relationshipDisplayMapping: Record<KnowledgeBaseRelationship, string> = {
    EQUAL: "is equal to",
    NOT_EQUAL: "is not equal to",
    SUBSET: "is a subset of",
    SUPERSET: "is a superset of",
};

@Component({
    selector: "la-knowledge-base-form",
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
    templateUrl: "./knowledge-base-form.component.html",
    styleUrls: ["./knowledge-base-form.component.scss"],
})
export class KnowledgeBaseFormComponent {
    public form = input.required<ParseInputForm>();

    public relationshipTypes = Object.values(KnowledgeBaseRelationship);

    public faPlus = faPlus;
    public faTrash = faTrash;

    public addKnowledgeBaseItem(): void {
        const newItem = kbForm("", "", KnowledgeBaseRelationship.EQUAL);
        this.form().controls.kbItems.push(newItem);
    }

    public getRelationshipTypeName(
        relationship: KnowledgeBaseRelationship
    ): string {
        return relationshipDisplayMapping[relationship];
    }

    public removeKnowledgeBaseItem(index: number): void {
        this.form().controls.kbItems.removeAt(index);
    }
}
