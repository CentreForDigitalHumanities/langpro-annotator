import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KbItemBadgeComponent } from './kb-item-badge.component';

describe('KbItemBadgeComponent', () => {
    let component: KbItemBadgeComponent;
    let fixture: ComponentFixture<KbItemBadgeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [KbItemBadgeComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(KbItemBadgeComponent);
        component = fixture.componentInstance;
        const componentRef = fixture.componentRef;
        componentRef.setInput(
            'usedKbItem',
            {
                "entity1": "Frodo",
                "relationship": "subset",
                "entity2": "Hobbit"
            }
        );
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
