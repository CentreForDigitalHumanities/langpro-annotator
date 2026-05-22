import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisibilityToggleComponent } from './visibility-toggle.component';
import { provideHttpClient } from '@angular/common/http';
import { ProblemService } from '@/services/problem.service';

describe('VisibilityToggleComponent', () => {
    let component: VisibilityToggleComponent;
    let fixture: ComponentFixture<VisibilityToggleComponent>;
    let problemService: ProblemService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [VisibilityToggleComponent],
            providers: [provideHttpClient()],
        })
            .compileComponents();

        fixture = TestBed.createComponent(VisibilityToggleComponent);
        component = fixture.componentInstance;
        problemService = TestBed.inject(ProblemService);
        const componentRef = fixture.componentRef;
        componentRef.setInput("problem", {
            id: 123,
            hidden: false
        });
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit toggleVisibility$ with hidden=true when problem is visible', () => {
        const emitted: { id: number, hidden: boolean; }[] = [];
        problemService.toggleVisibility$.subscribe(v => emitted.push(v));

        component.onToggleHidden();

        expect(emitted).toEqual([{ id: 123, hidden: true }]);
    });
});
