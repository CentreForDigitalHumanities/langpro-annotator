import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PremisesFormComponent } from "./premises-form/premises-form.component";
import { KnowledgeBaseFormComponent } from "./knowledge-base-form/knowledge-base-form.component";
import { AnnotateService } from "../../services/annotate.service";
import { SickProblemFormComponent } from "./sick-problem-form/sick-problem-form.component";
import { FracasProblemFormComponent } from "./fracas-problem-form/fracas-problem-form.component";

@Component({
    selector: "la-annotation-input",
    standalone: true,
    imports: [
        CommonModule,
        PremisesFormComponent,
        KnowledgeBaseFormComponent,
        SickProblemFormComponent,
        FracasProblemFormComponent,
    ],
    templateUrl: "./annotation-input.component.html",
    styleUrl: "./annotation-input.component.scss",
})
export class AnnotationInputComponent {
    public problemResponse$ = this.annotateService.problem$;

    constructor(private annotateService: AnnotateService) {}
}
