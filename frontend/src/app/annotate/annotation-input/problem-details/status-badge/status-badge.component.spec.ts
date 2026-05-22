import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusBadgeComponent } from './status-badge.component';
import { ProblemStatus } from '@/types';

describe('StatusBadgeComponent', () => {
    let component: StatusBadgeComponent;
    let fixture: ComponentFixture<StatusBadgeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [StatusBadgeComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(StatusBadgeComponent);
        component = fixture.componentInstance;
        const componentRef = fixture.componentRef;
        componentRef.setInput("status", ProblemStatus.BRONZE);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
