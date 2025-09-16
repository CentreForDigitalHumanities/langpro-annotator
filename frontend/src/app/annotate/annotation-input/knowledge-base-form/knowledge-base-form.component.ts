import { Component, inject, input } from "@angular/core";
import { FormGroup, Validators, FormControl } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { ParseInputForm } from "../annotation-input.component";
import { AppModeService } from "@/services/app-mode.service";
import { KnowledgeBaseRelationship } from "@/types";



const relationshipDisplayMapping: Record<KnowledgeBaseRelationship, string> = {
    equal: "is equal to",
    not_equal: "is not equal to",
    subset: "is a subset of",
    superset: "is a superset of",
};

@Component({
    selector: "la-knowledge-base-form",
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
    templateUrl: "./knowledge-base-form.component.html",
    styleUrls: ["./knowledge-base-form.component.scss"],
})
export class KnowledgeBaseFormComponent {
    private appModeService = inject(AppModeService);

    public form = input.required<ParseInputForm>();

    public relationshipTypes = Object.values(KnowledgeBaseRelationship);

    public faPlus = faPlus;
    public faTrash = faTrash;

    public viewMode$ = this.appModeService.viewMode$;

    public addKnowledgeBaseItem(): void {
        const newItem = new FormGroup({
            id: new FormControl<string>("new", {
                nonNullable: true
            }),
            entity1: new FormControl<string>("", {
                validators: [Validators.required],
                nonNullable: true,
            }),
            relationship: new FormControl<KnowledgeBaseRelationship>(
                KnowledgeBaseRelationship.EQUAL,
                {
                    validators: [Validators.required],
                    nonNullable: true,
                }
            ),
            entity2: new FormControl<string>("", {
                validators: [Validators.required],
                nonNullable: true,
            }),
        });
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
