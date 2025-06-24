import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProblemDetailsComponent } from "./problem-details.component";

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
        componentRef.setInput("problemDetails", {
            problemId: "1",
            dataset: "sick",
            judgement: "ENTAILMENT",
            section: "Test Section",
            subsection: "Test Subsection",
            comment: "This is a test comment.",
        });
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
