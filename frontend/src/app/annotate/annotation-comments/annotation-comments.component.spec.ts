import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";

import { ProblemService } from "@/services/problem.service";
import { Dataset, EntailmentLabel, KnowledgeBaseAnnotation, KnowledgeBaseRelationship, LabelAnnotation, Problem } from "@/types";
import { AnnotationCommentsComponent } from "./annotation-comments.component";

const baseAnnotationFields = {
    id: 1,
    session: 1,
    notes: "",
    removable: false,
    removedAt: null,
    removedBy: null,
};

function setupComponent(kbAnnotations: KnowledgeBaseAnnotation[] = [], labelAnnotations: LabelAnnotation[] = []) {
    const mockProblem: Problem = {
        id: 1,
        base: null,
        premises: [],
        hypothesis: null,
        entailmentLabel: EntailmentLabel.UNKNOWN,
        dataset: Dataset.USER,
        extraData: null,
        kbAnnotations,
        labelAnnotations,
    };

    TestBed.configureTestingModule({
        imports: [AnnotationCommentsComponent],
        providers: [
            { provide: ProblemService, useValue: { problem$: of(mockProblem) } },
        ],
    });

    const fixture = TestBed.createComponent(AnnotationCommentsComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
}

describe("AnnotationCommentsComponent", () => {
    it("should create", () => {
        const component = setupComponent();
        expect(component).toBeTruthy();
    });

    it("emits an 'added' event for each annotation", () => {
        const component = setupComponent(
            [],
            [
                {
                    ...baseAnnotationFields,
                    createdAt: "2024-01-01T10:00:00Z",
                    createdBy: "Alice",
                    label: { id: 1, text: "negation", description: "" },
                    attachedByCurrentUser: false,
                },
            ]
        );

        const events = component.filteredEvents()!;
        expect(events.length).toBe(1);
        expect(events[0]).toEqual(
            jasmine.objectContaining({
                kind: "added",
                annotationKind: "label",
                actor: "Alice",
                description: "negation",
            })
        );
    });

    it("emits a 'removed' event when removedAt is set", () => {
        const component = setupComponent(
            [
                {
                    ...baseAnnotationFields,
                    createdAt: "2024-01-01T10:00:00Z",
                    createdBy: "Bob",
                    removedAt: "2024-01-02T10:00:00Z",
                    removedBy: "3",
                    entity1: "cat",
                    relationship: KnowledgeBaseRelationship.EQUAL,
                    entity2: "feline",
                },
            ],
            []
        );

        const events = component.filteredEvents()!;
        expect(events.length).toBe(2);
        const removed = events.find((e) => e.kind === "removed");
        expect(removed).toEqual(
            jasmine.objectContaining({
                kind: "removed",
                annotationKind: "knowledgeBase",
                description: "cat = feline",
            })
        );
    });

    it("sorts events by timestamp descending", () => {
        const component = setupComponent(
            [],
            [
                {
                    ...baseAnnotationFields,
                    id: 1,
                    createdAt: "2024-01-01T10:00:00Z",
                    createdBy: "Alice",
                    label: { id: 1, text: "first", description: "" },
                    attachedByCurrentUser: false,
                },
                {
                    ...baseAnnotationFields,
                    id: 2,
                    createdAt: "2024-01-03T10:00:00Z",
                    createdBy: "Bob",
                    label: { id: 2, text: "latest", description: "" },
                    attachedByCurrentUser: false,
                },
            ]
        );

        const events = component.filteredEvents()!;
        expect(events[0].description).toBe("latest");
        expect(events[1].description).toBe("first");
    });
});
