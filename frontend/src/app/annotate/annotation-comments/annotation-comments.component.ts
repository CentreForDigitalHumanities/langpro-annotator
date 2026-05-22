import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faTag, faLink, faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import { map } from "rxjs";

import { ProblemService } from "@/services/problem.service";
import {
    KnowledgeBaseAnnotation,
    KnowledgeBaseRelationship,
    LabelAnnotation,
} from "@/types";

type AnnotationEventKind = "added" | "removed";
type AnnotationKind = "label" | "knowledgeBase";

export interface AnnotationEvent {
    kind: AnnotationEventKind;
    annotationKind: AnnotationKind;
    timestamp: string;
    actor: string;
    description: string;
}

const relationshipSymbols: Record<KnowledgeBaseRelationship, string> = {
    [KnowledgeBaseRelationship.EQUAL]: "=",
    [KnowledgeBaseRelationship.NOT_EQUAL]: "≠",
    [KnowledgeBaseRelationship.SUBSET]: "⊂",
    [KnowledgeBaseRelationship.SUPERSET]: "⊃",
};

function kbAnnotationToEvents(annotation: KnowledgeBaseAnnotation): AnnotationEvent[] {
    const description = `${annotation.entity1} ${relationshipSymbols[annotation.relationship]} ${annotation.entity2}`;
    const events: AnnotationEvent[] = [
        {
            kind: "added",
            annotationKind: "knowledgeBase",
            timestamp: annotation.createdAt,
            actor: annotation.createdBy,
            description,
        },
    ];
    if (annotation.removedAt && annotation.removedBy) {
        events.push({
            kind: "removed",
            annotationKind: "knowledgeBase",
            timestamp: annotation.removedAt,
            actor: annotation.removedBy,
            description,
        });
    }
    return events;
}

function labelAnnotationToEvents(annotation: LabelAnnotation): AnnotationEvent[] {
    const description = annotation.label.text;
    const events: AnnotationEvent[] = [
        {
            kind: "added",
            annotationKind: "label",
            timestamp: annotation.createdAt,
            actor: annotation.createdBy,
            description,
        },
    ];
    if (annotation.removedAt && annotation.removedBy) {
        events.push({
            kind: "removed",
            annotationKind: "label",
            timestamp: annotation.removedAt,
            actor: annotation.removedBy,
            description,
        });
    }
    return events;
}

@Component({
    selector: "la-annotation-comments",
    standalone: true,
    imports: [CommonModule, FontAwesomeModule],
    templateUrl: "./annotation-comments.component.html",
    styleUrl: "./annotation-comments.component.scss",
})
export class AnnotationCommentsComponent {
    private readonly problemService = inject(ProblemService);

    public readonly events$ = this.problemService.problem$.pipe(
        map((problem) => {
            if (!problem) {
                return [];
            }
            return [
                ...problem.kbAnnotations.flatMap(kbAnnotationToEvents),
                ...problem.labelAnnotations.flatMap(labelAnnotationToEvents),
            ].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
        })
    );

    public readonly faPlus = faPlus;
    public readonly faMinus = faMinus;
    public readonly faTag = faTag;
    public readonly faLink = faLink;
}
