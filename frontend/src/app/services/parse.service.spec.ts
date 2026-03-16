import { TestBed } from '@angular/core/testing';

import { provideHttpClient } from '@angular/common/http';

import { ParseService, nltk2tableau } from './parse.service';
import realNltk from '@/shared/mockNltkProof';
import realTableau from '@/shared/mockTableauTree';

describe('ParseService', () => {
    let service: ParseService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient()]
        });
        service = TestBed.inject(ParseService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});

describe('nltk2tableau', () => {
    it('handles a trivial dead end', () => {
        const nltk = {node: 'Model'};
        const tableau = {nodes: [{end: true}]};
        expect(nltk2tableau(nltk)).toEqual(tableau);
    });

    it('handles a closing end', () => {
        const nltk = {node: 'Closed\ncl_subsumption([1, 2])'};
        const tableau = {nodes: [{
            end: true,
            rule: 'cl_subsumption([1, 2])',
        }]};
        expect(nltk2tableau(nltk)).toEqual(tableau);
    });

    it('handles nested nodes', () => {
        const nltk = {
            node: '1\nterm\nTrue',
            children: [{
                node: '2:some_rule([1])\nanotherterm\n[c1]\nFalse',
                children: [{
                    node: '3:another_rule([2])\n[c1]\nterm\nTrue',
                    children: [{
                        node: '4:rule([1])\n[c2]\nterm\n[term]\nTrue',
                        children: [{
                            node: 'Model',
                        }],
                    }],
                }],
            }],
        };
        const tableau = {
            nodes: [{
                id: 1,
                head: 'term',
                sign: true,
            }, {
                id: 2,
                rule: 'some_rule([1])',
                head: 'anotherterm',
                args: 'c1',
                sign: false,
            }, {
                id: 3,
                rule: 'another_rule([2])',
                mod: 'c1',
                head: 'term',
                sign: true,
            }, {
                id: 4,
                rule: 'rule([1])',
                mod: 'c2',
                head: 'term',
                args: 'term',
                sign: true,
            }, {
                end: true,
            }],
        };
        expect(nltk2tableau(nltk)).toEqual(tableau);
    });

    it('can handle branching', () => {
        const nltk = {
            node: '1:rule([1, 2])\nterm\n[arg]\nFalse',
            children: [{
                node: 'Model',
            }, {
                node: 'Closed\nclosing_rule([1])',
            }],
        };
        const tableau = {
            nodes: [{
                id: 1,
                rule: 'rule([1, 2])',
                head: 'term',
                args: 'arg',
                sign: false,
            }],
            subtrees: [{
                nodes: [{end: true}],
            }, {
                nodes: [{end: true, rule: 'closing_rule([1])'}],
            }],
        };
        expect(nltk2tableau(nltk)).toEqual(tableau);
    });

    it('does not cause a stack overflow', () => {
        let nltk: any = {node: 'Model'};
        const tableau: any = {nodes: []};
        for (let i = 0; i < 100000; ++i) {
            nltk = {
                node: '1\nterm\nFalse',
                children: [nltk],
            };
            tableau.nodes.push({
                id: 1,
                head: 'term',
                sign: false,
            });
        }
        tableau.nodes.push({end: true});
        expect(nltk2tableau(nltk)).toEqual(tableau);
    });

    it('can process real-world data', () => {
        expect(nltk2tableau(realNltk)).toEqual(realTableau);
    });
});
