import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusInfoModalComponent } from './status-info-modal.component';

describe('StatusInfoModalComponent', () => {
    let component: StatusInfoModalComponent;
    let fixture: ComponentFixture<StatusInfoModalComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [StatusInfoModalComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(StatusInfoModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
