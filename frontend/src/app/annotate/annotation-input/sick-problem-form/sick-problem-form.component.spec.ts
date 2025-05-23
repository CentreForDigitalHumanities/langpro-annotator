import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CommonModule } from "@angular/common";
import { SickProblemFormComponent } from "./sick-problem-form.component";
import { SickProblem } from "../../../types";

describe("SickProblemFormComponent", () => {
    let component: SickProblemFormComponent;
    let fixture: ComponentFixture<SickProblemFormComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CommonModule, SickProblemFormComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(SickProblemFormComponent);
        component = fixture.componentInstance;
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
