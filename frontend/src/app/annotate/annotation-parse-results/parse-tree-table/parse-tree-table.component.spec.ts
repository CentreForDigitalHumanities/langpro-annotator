import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParseTreeTableComponent, extractRule } from './parse-tree-table.component';
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

describe('extractRule', () => {
    describe('standard format', () => {
        it('should extract rule and content from standard format', () => {
            const result = extractRule('fa[s:ng-np]');
            expect(result).toEqual({ rule: 'fa', content: 's:ng-np' });
        });

        it('should extract rule with complex content', () => {
            const result = extractRule('fa[(s:dcl\\np)/np]');
            expect(result).toEqual({ rule: 'fa', content: '(s:dcl\\np)/np' });
        });
    });

    describe('trivial @ rule', () => {
        it('should return empty rule for @ symbol', () => {
            const result = extractRule('@[np:nb]');
            expect(result).toEqual({ rule: '', content: 'np:nb' });
        });
    });

    describe('handle extra brackets', () => {
        it('should strip extra opening brackets from content', () => {
            const result = extractRule('fa[s:[ng-np]');
            expect(result).toEqual({ rule: 'fa', content: 's:ng-np' });
        });

        it('should strip extra closing brackets from content', () => {
            const result = extractRule('fa[s:ng]-np]');
            expect(result).toEqual({ rule: 'fa', content: 's:ng-np' });
        });

        it('should strip multiple extra brackets from content', () => {
            const result = extractRule('fa[s:[ng]-[np]]');
            expect(result).toEqual({ rule: 'fa', content: 's:ng-np' });
        });

        it('should strip all internal brackets', () => {
            const result = extractRule('ba[[[s:dcl]]]');
            expect(result).toEqual({ rule: 'ba', content: 's:dcl' });
        });
    });
});
