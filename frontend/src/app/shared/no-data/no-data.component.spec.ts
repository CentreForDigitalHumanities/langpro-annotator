import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoDataComponent } from './no-data.component';

describe('NoDataComponent', () => {
    let component: NoDataComponent;
    let fixture: ComponentFixture<NoDataComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [NoDataComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(NoDataComponent);
        component = fixture.componentInstance;
        const componentRef = fixture.componentRef;
        componentRef.setInput("dataType", "parse");
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
