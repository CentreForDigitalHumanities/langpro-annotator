import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisibilityToggleComponent } from './visibility-toggle.component';

describe('VisibilityToggleComponent', () => {
    let component: VisibilityToggleComponent;
    let fixture: ComponentFixture<VisibilityToggleComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [VisibilityToggleComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(VisibilityToggleComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
