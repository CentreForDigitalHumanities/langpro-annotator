import { Component, computed, signal, ChangeDetectionStrategy, input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faPlus, faMinus, faBook, faTag, faPen, faCircleCheck } from "@fortawesome/free-solid-svg-icons";

import {
    AnnotationEvent,
    KB_RELATIONSHIP_SYMBOLS,
    KnowledgeBaseRelationship,
    AnnotationEventRecord,
    KnowledgeBaseItem
} from "@/types";
import { RouterModule } from "@angular/router";
import { FilterCheckboxComponent } from "./filter-checkbox/filter-checkbox.component";

@Component({
    selector: "la-annotation-list",
    standalone: true,
    imports: [CommonModule, FontAwesomeModule, RouterModule, FilterCheckboxComponent],
    templateUrl: "./annotation-list.component.html",
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: "./annotation-list.component.scss",
})
export class AnnotationListComponent {
    public showProblemLinks = input.required<boolean>();
    public annotations = input.required<AnnotationEvent[]>();

    public showAdded = signal(true);
    public showRemoved = signal(true);
    public showUpdated = signal(true);
    public showLabels = signal(true);
    public showKB = signal(true);
    public showStatus = signal(true);

    private sortedEvents = computed(() => this.annotations()
        .map((event): AnnotationEventRecord => {
            return {
                eventKind: event.eventKind === "created"
                    ? "created"
                    : event.eventKind === "updated"
                        ? "updated"
                        : "removed",
                annotationKind: event.annotationKind,
                timestamp: event.timestamp,
                actor: event.actor,
                description: getEventDescription(event),
                problemId: event.problemId,
            };

        })
        .sort((a, b) => a.timestamp < b.timestamp ? 1 : -1)
    );

    public filteredEvents = computed(() => {
        const events = this.sortedEvents();
        if (events === null) {
            return null;
        }
        return events.filter((event) => this.isEventShown(event));
    });

    public totalCount = computed(() => this.annotations()?.length ?? 0);

    public faPlus = faPlus;
    public faMinus = faMinus;
    public faPen = faPen;
    public faCircleCheck = faCircleCheck;
    public faBook = faBook;
    public faTag = faTag;

    private isEventShown(event: AnnotationEventRecord): boolean {
        let shownBasedOnEventKind = false;
        let shownBasedOnAnnotationKind = false;

        switch (event.eventKind) {
            case "created":
                shownBasedOnEventKind = this.showAdded();
                break;
            case "updated":
                shownBasedOnEventKind = this.showUpdated();
                break;
            case "removed":
                shownBasedOnEventKind = this.showRemoved();
                break;
        }

        switch (event.annotationKind) {
            case "label":
                shownBasedOnAnnotationKind = this.showLabels();
                break;
            case "knowledgeBase":
                shownBasedOnAnnotationKind = this.showKB();
                break;
        }

        return shownBasedOnEventKind && shownBasedOnAnnotationKind;
    }

}

function getEventDescription(event: AnnotationEvent): string {
    const state = event.eventKind === "removed"
        ? event.beforeState
        : event.afterState;

    if (!state) {
        return "Unknown";
    }

    switch (event.annotationKind) {
        case "knowledgeBase": {
            const item = state as KnowledgeBaseItem;
            const { relationship, entity1, entity2 } = item;
            const symbol = KB_RELATIONSHIP_SYMBOLS[relationship];
            return `${entity1} ${symbol} ${entity2}`;
        }
        case "label":
            return "label" in state ? state.label : "Unknown label";
    }
}


