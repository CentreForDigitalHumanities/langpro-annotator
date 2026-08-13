import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LangProPredictionComponent } from './langpro-prediction.component';

describe('LangProPredictionComponent', () => {
    let component: LangProPredictionComponent;
    let fixture: ComponentFixture<LangProPredictionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LangProPredictionComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(LangProPredictionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
