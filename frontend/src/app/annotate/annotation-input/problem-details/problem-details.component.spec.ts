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
                id: 1
            },
            dataset: Dataset.SICK,
        });
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
