import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParseTreeTableComponent } from './parse-tree-table.component';
import { TreeWithType } from '../annotation-parse-results.component';

const mockTree: TreeWithType = {
    type: "CCG Tree",
    tree: {
        node: ["NP", "The", "the", "DT", "O", "NP"],
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
