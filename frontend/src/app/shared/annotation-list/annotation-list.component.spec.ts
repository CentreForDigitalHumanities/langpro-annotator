import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AnnotationEvent, KnowledgeBaseRelationship } from "@/types";
import { AnnotationListComponent } from "./annotation-list.component";
import { ComponentRef } from "@angular/core";

const mockAnnotations: AnnotationEvent[] = [{
    id: 1,
    session: 1,
    problemId: 1,
    eventKind: "created",
    annotationKind: "label",
    timestamp: "2024-01-01T10:00:00Z",
    actor: "Alice",
    annotationId: 1,
    beforeState: null,
    afterState: { label: "negation" },
}];

describe("AnnotationListComponent", () => {
    let component: AnnotationListComponent;
    let fixture: ComponentFixture<AnnotationListComponent>;
    let componentRef: ComponentRef<AnnotationListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AnnotationListComponent],
        }).compileComponents();


        fixture = TestBed.createComponent(AnnotationListComponent);
        componentRef = fixture.componentRef;
        component = fixture.componentInstance;

        componentRef.setInput("showProblemLinks", true);
        componentRef.setInput("annotations", mockAnnotations);

        await fixture.whenStable();
    });


    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("emits an 'added' event for each annotation", () => {
        componentRef.setInput("annotations", [
            {
                id: 1,
                session: 1,
                problemId: 1,
                eventKind: "created",
                annotationKind: "label",
                timestamp: "2024-01-01T10:00:00Z",
                actor: "Alice",
                annotationId: 1,
                beforeState: null,
                afterState: { label: "negation" },
            },
        ]);

        const events = component.filteredEvents()!;
        expect(events.length).toBe(1);
        expect(events[0].eventKind).toBe("created");
        expect(events[0].annotationKind).toBe("label");
        expect(events[0].actor).toBe("Alice");
        expect(events[0].description).toBe("negation");
    });

    it("emits a 'removed' event when removedAt is set", () => {
        componentRef.setInput("annotations", [
            {
                id: 1,
                session: 1,
                problemId: 1,
                eventKind: "created",
                annotationKind: "knowledgeBase",
                timestamp: "2024-01-01T10:00:00Z",
                actor: "Bob",
                annotationId: 1,
                beforeState: null,
                afterState: {
                    entity1: "cat",
                    relationship: KnowledgeBaseRelationship.EQUAL,
                    entity2: "feline",
                },
            },
            {
                id: 2,
                session: 1,
                problemId: 1,
                eventKind: "removed",
                annotationKind: "knowledgeBase",
                timestamp: "2024-01-02T10:00:00Z",
                actor: "3",
                annotationId: 1,
                beforeState: {
                    entity1: "cat",
                    relationship: KnowledgeBaseRelationship.EQUAL,
                    entity2: "feline",
                },
                afterState: null,
            },
        ]);

        const events = component.filteredEvents()!;
        expect(events.length).toBe(2);
        const removed = events.find((e) => e.eventKind === "removed");
        expect(removed!.eventKind).toBe("removed");
        expect(removed!.annotationKind).toBe("knowledgeBase");
        expect(removed!.description).toBe("cat ≡ feline");
    });

    it("sorts events by timestamp descending", () => {
        componentRef.setInput("annotations",
            [
                {
                    id: 1,
                    session: 1,
                    problemId: 1,
                    eventKind: "created",
                    annotationKind: "label",
                    timestamp: "2024-01-01T10:00:00Z",
                    actor: "Alice",
                    annotationId: 1,
                    beforeState: null,
                    afterState: { label: "first" },
                },
                {
                    id: 2,
                    session: 1,
                    problemId: 1,
                    eventKind: "created",
                    annotationKind: "label",
                    timestamp: "2024-01-03T10:00:00Z",
                    actor: "Bob",
                    annotationId: 2,
                    beforeState: null,
                    afterState: { label: "latest" },
                },
            ]
        );

        const events = component.filteredEvents()!;
        expect(events[0].description).toBe("latest");
        expect(events[1].description).toBe("first");
    });
});
