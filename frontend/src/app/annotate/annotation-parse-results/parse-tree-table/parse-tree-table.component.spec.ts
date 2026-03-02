import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParseTreeTableComponent } from './parse-tree-table.component';
import { ParseTree, ParseTreeType } from '../types';

const mockTree: ParseTree = {
    type: ParseTreeType.CCG_DERIVATION,
    root: {
        type: "leaf",
        lem: "dog",
        tok: "Dog",
        pos: "NN",
        ner: "O",
        cat: "N"
    }
}

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
        const componentRef = fixture.componentRef;
        componentRef.setInput(
            "tree",
            mockTree
        );
        fixture.detectChanges();

    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
