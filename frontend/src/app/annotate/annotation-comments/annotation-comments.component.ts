import { Component, computed, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faPlus, faMinus, faBook, faTag } from "@fortawesome/free-solid-svg-icons";
import { map } from "rxjs";
import { toSignal } from "@angular/core/rxjs-interop";

import { ProblemService } from "@/services/problem.service";
import {
    KnowledgeBaseAnnotation,
    KnowledgeBaseRelationship,
    LabelAnnotation,
} from "@/types";

type AnnotationEventKind = "added" | "removed";
type AnnotationKind = "label" | "knowledgeBase";

export interface AnnotationEvent {
    eventKind: AnnotationEventKind;
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

function annotationToEvent(annotation: LabelAnnotation | KnowledgeBaseAnnotation): AnnotationEvent[] {
    const isLabelAnnotation = "label" in annotation;
    const description = isLabelAnnotation ? annotation.label.text : `${annotation.entity1} ${relationshipSymbols[annotation.relationship]} ${annotation.entity2}`;
    const annotationKind: AnnotationKind = isLabelAnnotation ? "label" : "knowledgeBase";
    const events: AnnotationEvent[] = [{
        eventKind: "added",
        annotationKind,
        timestamp: annotation.createdAt,
        actor: annotation.createdBy,
        description,
    }];
    if (annotation.removedAt && annotation.removedBy) {
        events.push({
            eventKind: "removed",
            annotationKind,
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
    private problemService = inject(ProblemService);

    private allEvents = toSignal(
        this.problemService.problem$.pipe(
            map((problem) => {
                if (!problem) {
                    return [];
                }
                return [
                    ...problem.kbAnnotations.flatMap(annotationToEvent),
                    ...problem.labelAnnotations.flatMap(annotationToEvent),
                ].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
            })
        ),
        { initialValue: null }
    );

    public showAdded = signal(true);
    public showRemoved = signal(true);
    public showLabels = signal(true);
    public showKB = signal(true);

    public filteredEvents = computed(() => {
        const events = this.allEvents();
        if (events === null) {
            return null;
        }
        return events.filter(
            (e) =>
                (e.eventKind === "added" ? this.showAdded() : this.showRemoved()) &&
                (e.annotationKind === "label" ? this.showLabels() : this.showKB())
        );
    });

    public totalCount = computed(() => this.allEvents()?.length ?? 0);

    public faPlus = faPlus;
    public faMinus = faMinus;
    public faBook = faBook;
    public faTag = faTag;
}
