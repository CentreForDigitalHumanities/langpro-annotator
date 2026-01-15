import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProblemLabelsComponent } from './problem-labels.component';
import { provideHttpClient } from '@angular/common/http';

describe('ProblemLabelsComponent', () => {
    let component: ProblemLabelsComponent;
    let fixture: ComponentFixture<ProblemLabelsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ProblemLabelsComponent],
            providers: [provideHttpClient()]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ProblemLabelsComponent);
        component = fixture.componentInstance;
        const componentRef = fixture.componentRef;
        componentRef.setInput("attachedLabels", []);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
