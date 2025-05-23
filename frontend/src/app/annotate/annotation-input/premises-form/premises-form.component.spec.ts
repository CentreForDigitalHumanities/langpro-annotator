import { ComponentFixture, TestBed } from "@angular/core/testing";

import { PremisesFormComponent } from "./premises-form.component";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";

describe("PremisesFormComponent", () => {
    let component: PremisesFormComponent;
    let fixture: ComponentFixture<PremisesFormComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PremisesFormComponent],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(PremisesFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
