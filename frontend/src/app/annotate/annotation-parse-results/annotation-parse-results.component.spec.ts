import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AnnotationParseResultsComponent } from "./annotation-parse-results.component";

describe("AnnotationParseResultsComponent", () => {
    let component: AnnotationParseResultsComponent;
    let fixture: ComponentFixture<AnnotationParseResultsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AnnotationParseResultsComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(AnnotationParseResultsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
