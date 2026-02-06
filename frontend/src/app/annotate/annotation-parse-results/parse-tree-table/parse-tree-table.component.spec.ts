import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParseTreeTableComponent } from './parse-tree-table.component';

describe('ParseTreeTableComponent', () => {
    let component: ParseTreeTableComponent;
    let fixture: ComponentFixture<ParseTreeTableComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ParseTreeTableComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ParseTreeTableComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
