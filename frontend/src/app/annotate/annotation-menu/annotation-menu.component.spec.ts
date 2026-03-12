import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";

import { AnnotationMenuComponent } from "./annotation-menu.component";

describe("AnnotationMenuComponent", () => {
    let component: AnnotationMenuComponent;
    let fixture: ComponentFixture<AnnotationMenuComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AnnotationMenuComponent],
            providers: [provideHttpClient()],
        }).compileComponents();

        fixture = TestBed.createComponent(AnnotationMenuComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
