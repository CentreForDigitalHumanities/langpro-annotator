import { ComponentFixture, TestBed } from "@angular/core/testing";

import { PremisesFormComponent } from "./premises-form.component";

describe("PremisesFormComponent", () => {
    let component: PremisesFormComponent;
    let fixture: ComponentFixture<PremisesFormComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PremisesFormComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(PremisesFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
