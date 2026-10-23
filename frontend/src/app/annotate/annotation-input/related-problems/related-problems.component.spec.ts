import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RelatedProblemsComponent } from "./related-problems.component";

describe("RelatedProblemsComponent", () => {
    let component: RelatedProblemsComponent;
    let fixture: ComponentFixture<RelatedProblemsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RelatedProblemsComponent],
            providers: []
        }).compileComponents();

        fixture = TestBed.createComponent(RelatedProblemsComponent);
        component = fixture.componentInstance;
        const componentRef = fixture.componentRef;
        componentRef.setInput("currentProblem", {
            id: 1,
            premises: [],
            hypothesis: "",
            entailmentLabel: "entailment",
            extraData: {},
        });
        componentRef.setInput("sentence", {
            text: "This is a test sentence.",
            relatedProblems: [],
        });

        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});