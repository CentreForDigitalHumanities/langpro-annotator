import { Component } from "@angular/core";
import { PremisesFormComponent } from "./premises-form/premises-form.component";
import { KnowledgeBaseFormComponent } from "./knowledge-base-form/knowledge-base-form.component";

@Component({
    selector: "la-annotation-input",
    standalone: true,
    imports: [PremisesFormComponent, KnowledgeBaseFormComponent],
    templateUrl: "./annotation-input.component.html",
    styleUrl: "./annotation-input.component.scss",
})
export class AnnotationInputComponent {}
