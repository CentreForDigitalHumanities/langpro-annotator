import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AnnotationTableauComponent } from "./annotation-tableau.component";

describe("AnnotationTableauComponent", () => {
    let component: AnnotationTableauComponent;
    let fixture: ComponentFixture<AnnotationTableauComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AnnotationTableauComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(AnnotationTableauComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
