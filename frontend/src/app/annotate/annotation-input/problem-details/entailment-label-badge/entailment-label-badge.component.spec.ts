import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EntailmentLabelBadgeComponent } from "./entailment-label-badge.component";
import { EntailmentLabel } from "../../../../types";

describe("EntailmentLabelBadgeComponent", () => {
    let component: EntailmentLabelBadgeComponent;
    let fixture: ComponentFixture<EntailmentLabelBadgeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [EntailmentLabelBadgeComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(EntailmentLabelBadgeComponent);
        component = fixture.componentInstance;
        const componentRef = fixture.componentRef;
        componentRef.setInput("entailmentLabel", EntailmentLabel.ENTAILMENT);
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
