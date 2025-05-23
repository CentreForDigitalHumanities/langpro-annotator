import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AnnotationInputComponent } from "./annotation-input.component";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";

describe("AnnotationInputComponent", () => {
    let component: AnnotationInputComponent;
    let fixture: ComponentFixture<AnnotationInputComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AnnotationInputComponent],
            providers: [provideHttpClient(), provideHttpClientTesting()],
        }).compileComponents();

        fixture = TestBed.createComponent(AnnotationInputComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
