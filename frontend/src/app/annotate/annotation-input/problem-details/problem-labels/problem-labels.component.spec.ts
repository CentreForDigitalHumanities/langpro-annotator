import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProblemLabelsComponent } from './problem-labels.component';

describe('ProblemLabelsComponent', () => {
    let component: ProblemLabelsComponent;
    let fixture: ComponentFixture<ProblemLabelsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ProblemLabelsComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ProblemLabelsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
