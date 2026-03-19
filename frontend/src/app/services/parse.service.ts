import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Subject, switchMap, catchError, of, merge, map, share } from 'rxjs';
import { ParseInput } from '@/annotate/annotation-input/annotation-input.component';
import { ProblemService } from './problem.service';
import { ParseResponse } from '@/types';


@Injectable({
    providedIn: 'root'
})
export class ParseService {
    private http = inject(HttpClient);
    private problemService = inject(ProblemService);

    // Sink for triggering parse-and-prove requests to the backend.
    public submit$ = new Subject<ParseInput>();

    // Clear parse results when a new problem is loaded.
    private clearOnNewProblem$ = this.problemService.problemResponse$.pipe(map(() => null));

    // Raw responses from the backend.
    private parseResults$ = this.submit$.pipe(
        switchMap((form) =>
            this.http.post<ParseResponse>("/api/problem/parse", form).pipe(
                catchError((error) => {
                    console.error(`Error parsing problem:`, error);
                    return of({ data: null, error: error.message || "An error occurred while parsing the problem." });
                }),
            )
        ),
        share()
    );

    public parse$ = merge(
        this.parseResults$,
        this.clearOnNewProblem$
    );

    // Proofs from the response in a format that is easier to handle than the
    // stringly NLTK.Tree serialization.
    public proofs$ = this.parse$.pipe(map(extractProofs));
}

/**
 * Given a `{data: {ccg_trees, proofs}}` response from the backend, tease out
 * the `proofs` and apply the `nltk2tableau` transformation to each proof
 * within.
 */
function extractProofs(
    response: ParseResponse | {data: null, error: any} | null
) {
    if (!response || !response.data) return null;
    // This is basically just `_.mapObject(response.data.proofs, nltk2tableau)`,
    // but we don't depend on Underscore yet.
    const {entailment, contradiction} = response.data.proofs;
    return {
        entailment: nltk2tableau(entailment),
        contradiction: nltk2tableau(contradiction),
    };
}

// Regular expressions matching the stringified nltk.Tree node payloads.
const openLeafPattern = /^Model$/;
const closedLeafPattern = /^Closed\n(?<rule>.+)$/;
const internalNodePattern = /^(?<id>\d+):?(?<rule>.+)?(\n\[(?<mod>.+)\])?\n(?<head>.+)(\n\[(?<args>.+)\])?\n(?<sign>True|False)$/;

// Helpers for the functions below.
const emptyTableau = (): any => ({nodes: []});
const pairNodes = (other: any[]) =>
    (node: any, index: number) => [node, other[index]];
const quotes = /'/g;
const unquote = (text: string) => text.replace(quotes, '');

/**
 * Given a single proof in serialized NLTK.Tree format, return the same proof in
 * a more convenient format where each node has explicitly labeled `id`, `rule`,
 * `mod`, `head`, `args` and `sign`.
 *
 * This function can handle proof trees of arbitrary depth without causing a
 * stack overflow.
 */
export function nltk2tableau(nltk: any) {
    const tree = emptyTableau();
    // We will be using trampolining instead of recursion. A general but
    // admittedly not very helpful description can be found in the first bullet
    // of
    // https://en.wikipedia.org/wiki/Trampoline_(computing)#High-level_programming.
    // The gist is this: instead of recursing, functions return pieces of work
    // ("thunks") that should be executed next. The trampoline, which in this
    // case is the current function, takes care of executing the thunks.

    // The list of thunks to execute. One will be added for each tree node, one
    // will be taken off on each iteration. Since we are always calling
    // `nltkNode2tableauNode`, we leave this implicit in the thunk
    // representation. It consists only of the arguments that we are passing to
    // the function.
    const todo = [[nltk, tree]];
    // The core of the trampoline. Process one thunk at a time. We know we are
    // done when the list is empty.
    while (todo.length) {
        // The algorithm is written such that the order in which we process
        // child nodes does not matter, so we can simply pop thunks off the back
        // of the todo list. tsc is apparently unable to infer that `todo` is
        // guaranteed to be nonempty on the next line, hence the silencing
        // comment.
        // @ts-ignore
        const task: [any, any] = todo.pop();
        // Processing a thunk might produce zero or more new thunks, depending
        // on the number of children of the processed node.
        const newTasks = nltkNode2tableauNode(...task);
        todo.push(...newTasks);
    }
    return tree;
}

/**
 * Internal function that maps a single serialized NLTK.Tree node to an
 * explicitly structured node inside `tree`. This function relies on an external
 * trampoline (in `nltk2tableau`) and returns thunks instead of recursing into
 * child nodes.
 */
function nltkNode2tableauNode(nltk: any, tree: any) {
    // `nltk` is in a strictly nested format: each node contains its children.
    // Our own format does not follow this rule: chains of nodes with single
    // children are stored as adjacent elements in an array. `tree` is the
    // object that contains this array (`tree.nodes`). When there is a
    // bifurcation, the subtrees are stored inside `tree` rather than in the
    // bifurcating node.
    const node: any = parseNltkNode(nltk.node);
    tree.nodes.push(node);
    // With the node itself having been decoded, now comes the part where a
    // "normal" function would recurse and where we return follow-up thunks
    // instead.
    if (!nltk.children || !nltk.children.length) {
        node.end = true;
        // Leaf node. No recursion, no thunks.
        return [];
    }
    if (nltk.children.length === 1) {
        // Node with one child, the most common case. The child will be appended
        // to `tree.nodes` after the current node.
        return [[nltk.children[0], tree]];
    }
    // Multiple children. Most likely two, but the code would transparently
    // support larger numbers of children. We create empty subtrees so we can
    // pass those in the thunks as containers for the child nodes. The fact that
    // the subtrees have already been created, is what makes it possible to
    // process the children in arbitrary order.
    tree.subtrees = nltk.children.map(emptyTableau);
    // We essentially do a `_.zip(nltk.children, tree.subtrees)` in order to
    // create the thunks. I could have fumbled with `Iterator.zip` instead, but
    // that feels like more hassle and the polyfill would be huge.
    return nltk.children.map(pairNodes(tree.subtrees));
}

/**
 * Decode the payload of a serialized nltk.Tree node, where all information is
 * combined in a single string, back to an object with explicitly labeled parts.
 */
function parseNltkNode(text: string) {
    if (openLeafPattern.test(text)) return {};
    let match;
    if (match = text.match(closedLeafPattern)) return match.groups;
    match = text.match(internalNodePattern);
    if (!match || !match.groups) return {head: text};
    const result: any = {
        id: +match.groups['id'],
        head: match.groups['head'],
        sign: match.groups['sign'] === 'True',
    };
    if (match.groups['rule']) result.rule = unquote(match.groups['rule']);
    if (match.groups['mod']) result.mod = match.groups['mod'];
    if (match.groups['args']) result.args = match.groups['args'];
    return result;
}
