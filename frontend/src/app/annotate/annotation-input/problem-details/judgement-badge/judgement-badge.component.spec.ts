import { ComponentFixture, TestBed } from "@angular/core/testing";

import { JudgementBadgeComponent } from "./judgement-badge.component";

describe("JudgementBadgeComponent", () => {
    let component: JudgementBadgeComponent;
    let fixture: ComponentFixture<JudgementBadgeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [JudgementBadgeComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(JudgementBadgeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
