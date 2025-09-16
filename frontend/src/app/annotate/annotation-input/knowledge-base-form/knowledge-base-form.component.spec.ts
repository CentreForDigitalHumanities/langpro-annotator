import { ComponentFixture, TestBed } from "@angular/core/testing";

import { KnowledgeBaseFormComponent } from "./knowledge-base-form.component";
import { FormArray, FormGroup } from "@angular/forms";
import { provideHttpClient } from "@angular/common/http";

describe("KnowledgeBaseFormComponent", () => {
    let component: KnowledgeBaseFormComponent;
    let fixture: ComponentFixture<KnowledgeBaseFormComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [KnowledgeBaseFormComponent],
            providers: [
                provideHttpClient(),
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(KnowledgeBaseFormComponent);
        component = fixture.componentInstance;
        const componentRef = fixture.componentRef;
        componentRef.setInput(
            "form",
            new FormGroup({
                kbItems: new FormArray([]),
            })
        );
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
