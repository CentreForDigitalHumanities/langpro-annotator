import { ComponentFixture, TestBed } from "@angular/core/testing";

import { KnowledgeBaseFormComponent } from "./knowledge-base-form.component";

describe("KnowledgeBaseFormComponent", () => {
    let component: KnowledgeBaseFormComponent;
    let fixture: ComponentFixture<KnowledgeBaseFormComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [KnowledgeBaseFormComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(KnowledgeBaseFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
