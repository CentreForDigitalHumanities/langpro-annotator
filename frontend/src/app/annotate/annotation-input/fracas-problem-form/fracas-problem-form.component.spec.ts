import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CommonModule } from "@angular/common";
import { FracasProblemFormComponent } from "./fracas-problem-form.component";
import { FracasProblem } from "../../../types";

describe("FracasProblemFormComponent", () => {
    let component: FracasProblemFormComponent;
    let fixture: ComponentFixture<FracasProblemFormComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CommonModule, FracasProblemFormComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(FracasProblemFormComponent);
        component = fixture.componentInstance;
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
