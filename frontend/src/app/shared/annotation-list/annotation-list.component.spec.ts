import { ComponentFixture, TestBed } from "@angular/core/testing";
import { of } from "rxjs";

import { ProblemService } from "@/services/problem.service";
import { CombinedAnnotation, Dataset, EntailmentLabel, KnowledgeBaseAnnotation, KnowledgeBaseRelationship, LabelAnnotation, Problem, ProblemStatus } from "@/types";
import { AnnotationListComponent } from "./annotation-list.component";
import { ComponentRef } from "@angular/core";

const baseAnnotationFields: Omit<LabelAnnotation, "label" | "attachedByCurrentUser" | "createdBy" | "createdAt" | "annotationKind"> = {
    id: 1,
    session: 1,
    notes: "",
    removable: false,
    removedAt: null,
    removedBy: null,
    problem: 1,
};

const mockAnnotations: CombinedAnnotation[] = [{
    ...baseAnnotationFields,
    annotationKind: "label",
    createdAt: "2024-01-01T10:00:00Z",
    createdBy: "Alice",
    label: { id: 1, text: "negation", description: "" },
    attachedByCurrentUser: false,
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

    // Needed to override the problem$ observable in the providers.
    // function recreateComponent(kbAnnotations: KnowledgeBaseAnnotation[] = [], labelAnnotations: LabelAnnotation[] = []) {
    // const mockProblem: Problem = {
    //     id: 1,
    //     base: null,
    //     premises: [],
    //     hypothesis: null,
    //     entailmentLabel: EntailmentLabel.UNKNOWN,
    //     dataset: Dataset.USER,
    //     gold: false,
    //     hidden: false,
    //     status: ProblemStatus.BRONZE,
    //     extraData: null,
    //     kbAnnotations,
    //     labelAnnotations,
    //     langproPrediction: null,
    //     usedKbItems: [],
    // };
    // TestBed.overrideProvider(ProblemService, { useValue: { problem$: of(mockProblem) } });
    // }



    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("emits an 'added' event for each annotation", () => {
        componentRef.setInput("annotations", [
            {
                ...baseAnnotationFields,
                annotationKind: "label",
                createdAt: "2024-01-01T10:00:00Z",
                createdBy: "Alice",
                label: { id: 1, text: "negation", description: "" },
                attachedByCurrentUser: false,
            },
        ]);

        const events = component.filteredEvents()!;
        expect(events.length).toBe(1);
        expect(events[0].eventKind).toBe("added");
        expect(events[0].annotationKind).toBe("label");
        expect(events[0].actor).toBe("Alice");
        expect(events[0].description).toBe("negation");
    });

    it("emits a 'removed' event when removedAt is set", () => {
        componentRef.setInput("annotations", [
            {
                ...baseAnnotationFields,
                annotationKind: "knowledgeBase",
                createdAt: "2024-01-01T10:00:00Z",
                createdBy: "Bob",
                removedAt: "2024-01-02T10:00:00Z",
                removedBy: "3",
                entity1: "cat",
                relationship: KnowledgeBaseRelationship.EQUAL,
                entity2: "feline",
            },
        ]);

        const events = component.filteredEvents()!;
        expect(events.length).toBe(2);
        const removed = events.find((e) => e.eventKind === "removed");
        expect(removed!.eventKind).toBe("removed");
        expect(removed!.annotationKind).toBe("knowledgeBase");
        expect(removed!.description).toBe("cat = feline");
    });

    it("sorts events by timestamp descending", () => {
        componentRef.setInput("annotations",
            [
                {
                    ...baseAnnotationFields,
                    id: 1,
                    annotationKind: "label",
                    createdAt: "2024-01-01T10:00:00Z",
                    createdBy: "Alice",
                    label: { id: 1, text: "first", description: "" },
                    attachedByCurrentUser: false,
                },
                {
                    ...baseAnnotationFields,
                    annotationKind: "label",
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
