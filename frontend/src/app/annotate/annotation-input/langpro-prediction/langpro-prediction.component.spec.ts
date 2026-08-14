import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LangProPredictionComponent } from './langpro-prediction.component';
import { provideHttpClient } from '@angular/common/http';

describe('LangProPredictionComponent', () => {
    let component: LangProPredictionComponent;
    let fixture: ComponentFixture<LangProPredictionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LangProPredictionComponent],
            providers: [provideHttpClient()],
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
