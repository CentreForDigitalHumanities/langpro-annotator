import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Subject, switchMap, catchError, of, merge, map } from 'rxjs';
import { ParseInput } from '@/annotate/annotation-input/annotation-input.component';
import { ProblemService } from './problem.service';
import { ParseResponseData } from '@/types';


export type ParseResponse = {
    data: ParseResponseData;
    error: string | null;
};

@Injectable({
    providedIn: 'root'
})
export class ParseService {
    private http = inject(HttpClient);
    private problemService = inject(ProblemService);

    public submit$ = new Subject<ParseInput>();

    // Clear parse results when a new problem is loaded.
    private clearOnNewProblem$ = this.problemService.problemResponse$.pipe(map(() => null));

    private parseResults$ = this.submit$.pipe(
        switchMap((form) =>
            this.http.post<ParseResponse>("/api/problem/parse", form).pipe(
                catchError((error) => {
                    console.error(`Error parsing problem:`, error);
                    return of({ data: null, error: error.message || "An error occurred while parsing the problem." });
                }),
            )
        )
    );

    public parse$ = merge(
        this.parseResults$,
        this.clearOnNewProblem$
    );

    public proofs$ = this.parse$.pipe(map(extractProofs));
}

function extractProofs(
    response: ParseResponse | {data: null, error: any} | null
) {
    if (!response || !response.data) return null;
    const {entailment, contradiction} = response.data.proofs;
    return {
        entailment: nltk2tableau(entailment),
        contradiction: nltk2tableau(contradiction),
    };
}

const emptyTableau = (): any => ({nodes: []});
const pairNodes = (other: any[]) =>
    (node: any, index: number) => [node, other[index]];

export function nltk2tableau(nltk: any) {
    const tree = emptyTableau();
    const todo = [[nltk, tree]];
    while (todo.length) {
        // @ts-ignore
        let task: [any, any] = todo.pop();
        let newTasks = nltkNode2tableauNode(...task);
        todo.push(...newTasks);
    }
    return tree;
}

function nltkNode2tableauNode(nltk: any, tree: any) {
    const node: any = {};
    tree.nodes.push(node);
    const lines = nltk.node.split('\n');
    if (lines[0] === 'Closed') {
        node.rule = lines[1];
    } else if (lines.length >= 3) {
        const sign = lines.pop();
        node.sign = (sign === 'True');
        const tagLine = lines.shift().split(':');
        node.id = +tagLine[0];
        if (tagLine[1]) node.rule = tagLine[1];
        const back = lines.pop();
        if (back.startsWith('[')) {
            node.args = back.slice(1, -1);
        } else {
            node.head = back;
        }
        const front = lines.shift();
        if (front != null) {
            if (front.startsWith('[')) {
                node.mod = front.slice(1, -1);
            } else {
                node.head = front;
            }
        }
        if (lines.length) node.head = lines[0];
    } else if (lines[0] !== 'Model') {
        node.head = nltk.node;
    }
    if (!nltk.children || !nltk.children.length) {
        node.end = true;
        return [];
    }
    if (nltk.children.length === 1) {
        return [[nltk.children[0], tree]];
    }
    tree.subtrees = nltk.children.map(emptyTableau);
    return nltk.children.map(pairNodes(tree.subtrees));
}
