import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AnnotationCommentsComponent } from "./annotation-comments.component";

describe("AnnotationCommentsComponent", () => {
    let component: AnnotationCommentsComponent;
    let fixture: ComponentFixture<AnnotationCommentsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AnnotationCommentsComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(AnnotationCommentsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
