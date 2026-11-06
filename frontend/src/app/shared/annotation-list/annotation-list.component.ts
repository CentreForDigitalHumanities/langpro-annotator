import { Component, computed, signal, ChangeDetectionStrategy, input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faPlus, faMinus, faBook, faTag } from "@fortawesome/free-solid-svg-icons";

import {
    AnnotationKind,
    CombinedAnnotation,
    KnowledgeBaseRelationship,
} from "@/types";
import { RouterModule } from "@angular/router";

type AnnotationEventKind = "added" | "removed";

export interface AnnotationEvent {
    eventKind: AnnotationEventKind;
    annotationKind: AnnotationKind;
    timestamp: string;
    actor: string;
    description: string;
    problemId: number;
}

const relationshipSymbols: Record<KnowledgeBaseRelationship, string> = {
    [KnowledgeBaseRelationship.EQUAL]: "=",
    [KnowledgeBaseRelationship.SUBSET]: "⊂",
    [KnowledgeBaseRelationship.DISJOINT]: "≠",
};

function annotationToEvent(annotation: CombinedAnnotation): AnnotationEvent[] {
    const isLabelAnnotation = annotation.annotationKind === "label";
    const description = isLabelAnnotation ? annotation.label.text : `${annotation.entity1} ${relationshipSymbols[annotation.relationship]} ${annotation.entity2}`;
    const events: AnnotationEvent[] = [{
        eventKind: "added",
        annotationKind: annotation.annotationKind,
        timestamp: annotation.createdAt,
        actor: annotation.createdBy,
        problemId: annotation.problem,
        description,
    }];
    if (annotation.removedAt) {
        events.push({
            eventKind: "removed",
            annotationKind: annotation.annotationKind,
            timestamp: annotation.removedAt,
            actor: annotation.removedBy ?? $localize`An unnamed user`,
            problemId: annotation.problem,
            description,
        });
    }
    return events;
}

@Component({
    selector: "la-annotation-list",
    standalone: true,
    imports: [CommonModule, FontAwesomeModule, RouterModule],
    templateUrl: "./annotation-list.component.html",
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: "./annotation-list.component.scss",
})
export class AnnotationListComponent {
    public showProblemLinks = input.required<boolean>();
    public annotations = input.required<CombinedAnnotation[]>();

    public showAdded = signal(true);
    public showRemoved = signal(true);
    public showLabels = signal(true);
    public showKB = signal(true);

    private sortedEvents = computed(() => this.annotations()
        .flatMap(annotationToEvent)
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    );

    public filteredEvents = computed(() => {
        const events = this.sortedEvents();
        if (events === null) {
            return null;
        }
        return events.filter(
            (e) =>
                (e.eventKind === "added" ? this.showAdded() : this.showRemoved()) &&
                (e.annotationKind === "label" ? this.showLabels() : this.showKB())
        );
    });

    public totalCount = computed(() => this.annotations()?.length ?? 0);

    public faPlus = faPlus;
    public faMinus = faMinus;
    public faBook = faBook;
    public faTag = faTag;
}
