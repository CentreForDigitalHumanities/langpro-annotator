import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LangProPredictionComponent } from './langpro-prediction.component';
import { EntailmentLabel } from '@/types';
import { FormGroup, FormControl } from '@angular/forms';

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
        const componentRef = fixture.componentRef;
        componentRef.setInput(
            "form",
            new FormGroup({
                langproPrediction: new FormControl(EntailmentLabel.ENTAILMENT, { nonNullable: true }),
            })
        );

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
