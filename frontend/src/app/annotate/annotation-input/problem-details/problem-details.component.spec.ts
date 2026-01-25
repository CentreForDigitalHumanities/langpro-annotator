import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProblemDetailsComponent } from "./problem-details.component";
import { Dataset, EntailmentLabel, Problem } from "../../../types";
import { provideHttpClient } from "@angular/common/http";

const createMockProblem = (
    id: number,
    dataset: Dataset,
    entailmentLabel: EntailmentLabel,
    extraData: any = {},
): Problem => ({
    id,
    base: null,
    dataset,
    entailmentLabel,
    premises: ["premise"],
    hypothesis: "hypothesis",
    kbItems: [],
    labels: [],
    extraData,
});

describe("ProblemDetailsComponent", () => {
    let component: ProblemDetailsComponent;
    let fixture: ComponentFixture<ProblemDetailsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ProblemDetailsComponent],
            providers: [provideHttpClient()]
        }).compileComponents();

        fixture = TestBed.createComponent(ProblemDetailsComponent);
        component = fixture.componentInstance;
        const componentRef = fixture.componentRef;
        componentRef.setInput("problem", createMockProblem(
            1,
            Dataset.SICK,
            EntailmentLabel.ENTAILMENT
        ));
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    describe("with SICK dataset problem", () => {
        beforeEach(() => {
            const problem = createMockProblem(
                1,
                Dataset.SICK,
                EntailmentLabel.ENTAILMENT,
            );
            fixture.componentRef.setInput("problem", problem);
            fixture.detectChanges();
        });

        it("should extract correct problem details", () => {
            expect(component.problemDetails()).toEqual({
                problemId: "1",
                baseProblemId: null,
                dataset: Dataset.SICK,
                entailmentLabel: EntailmentLabel.ENTAILMENT,
                section: null,
                subsection: null,
                comment: null,
                labelAnnotations: [],
            });
        });

        it("should compute sectionString as null", () => {
            expect(component.sectionString()).toBeNull();
        });
    });

    describe("with FRACAS dataset problem", () => {
        beforeEach(() => {
            const problem = createMockProblem(
                2,
                Dataset.FRACAS,
                EntailmentLabel.CONTRADICTION,
                {
                    sectionName: "Quantifiers",
                    subsectionName: "Some",
                    note: "A test note",
                },
            );
            fixture.componentRef.setInput("problem", problem);
            fixture.detectChanges();
        });

        it("should extract correct problem details", () => {
            expect(component.problemDetails()).toEqual({
                problemId: "2",
                baseProblemId: null,
                dataset: Dataset.FRACAS,
                entailmentLabel: EntailmentLabel.CONTRADICTION,
                section: "Quantifiers",
                subsection: "Some",
                comment: "A test note",
                labelAnnotations: [],
            });
        });

        it("should compute sectionString with section and subsection", () => {
            expect(component.sectionString()).toBe("Quantifiers | Some");
        });
    });

    describe("sectionString computation", () => {
        it("should show only section when subsection is null", () => {
            const problem = createMockProblem(
                5,
                Dataset.FRACAS,
                EntailmentLabel.ENTAILMENT,
                { sectionName: "SectionOnly" },
            );
            fixture.componentRef.setInput("problem", problem);
            fixture.detectChanges();
            expect(component.sectionString()).toBe("SectionOnly");
        });

        it("should show only subsection when section is null", () => {
            const problem = createMockProblem(
                6,
                Dataset.FRACAS,
                EntailmentLabel.ENTAILMENT,
                { subsectionName: "SubsectionOnly" },
            );
            fixture.componentRef.setInput("problem", problem);
            fixture.detectChanges();
            expect(component.sectionString()).toBe("SubsectionOnly");
        });
    });
});
