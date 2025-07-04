import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProblemDetailsComponent } from "./problem-details.component";
import { Dataset } from "../../../types";

describe("ProblemDetailsComponent", () => {
    let component: ProblemDetailsComponent;
    let fixture: ComponentFixture<ProblemDetailsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ProblemDetailsComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ProblemDetailsComponent);
        component = fixture.componentInstance;
        const componentRef = fixture.componentRef;
        componentRef.setInput("problem", {
            problem: {
                pairId: "1",
                sentenceOne: "This is a sentence.",
                sentenceTwo: "This is another sentence.",
                entailmentLabel: "NEUTRAL",
                relatednessScore: 0.5,
            },
            type: Dataset.SICK,
        });
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
