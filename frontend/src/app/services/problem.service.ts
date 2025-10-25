import { ParseInput } from "@/annotate/annotation-input/annotation-input.component";
import { ProblemResponse, SaveProblemResponse, Dataset, EntailmentLabel } from "@/types";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { ParamMap } from "@angular/router";
import { Subject, Observable, switchMap, of, shareReplay, exhaustMap, catchError, map, BehaviorSubject, filter } from "rxjs";

interface AllParams {
    params: ParamMap;
    queryParams: ParamMap;
    edit: boolean;
}

export enum AppMode {
    BROWSE = "browse",
    EDIT = "edit",
    ADD = "add",
}

@Injectable({
    providedIn: 'root'
})
export class ProblemService {
    private http = inject(HttpClient);

    public allParams$ = new BehaviorSubject<AllParams | null>(null);

    // Submit a new problem to be saved to the database.
    public submit$ = new Subject<ParseInput>();

    public problemResponse$: Observable<ProblemResponse | null> = this.allParams$.pipe(
        filter(allParams => allParams !== null),
        switchMap(({ params, queryParams }) => {
            const problemId = params.get("problemId");
            if (!problemId) {
                return of(null);
            }
            const baseParam = this.extractBaseParam(queryParams);

            return problemId === "new" ? this.newProblem$(baseParam) : this.existingProblem$(problemId, queryParams);
        }),
        shareReplay(1)
    );

    private extractBaseParam(queryParams: ParamMap): number | null {
        const baseStr = queryParams.get("base");
        if (!baseStr) {
            return null;
        }
        return parseInt(baseStr, 10);
    }

    public problem$ = this.problemResponse$.pipe(
        map(response => response?.problem ?? null),
        shareReplay(1)
    );

    public appMode$ = this.allParams$.pipe(
        filter(allParams => allParams !== null),
        map(({ params, edit }) => {
            if (edit) {
                return AppMode.EDIT;
            }
            if (params.get("problemId") === "new") {
                return AppMode.ADD;
            }
            return AppMode.BROWSE;
        }),
        shareReplay(1)
    );

    public loading$ = this.appMode$.pipe(map(mode => mode === undefined));

    public saveProblem$ = this.submit$.pipe(
        exhaustMap((problem) => {
            const url = `/api/problem/${problem.id ?? ""}`;
            return this.http.post<SaveProblemResponse>(url, problem).pipe(
                catchError((error) => {
                    console.error('Error saving problem:', error);
                    return of({ id: null, error: 'Failed to save problem' });
                })
            );
        })
    );

    private newProblem$(baseParam: number | null): Observable<ProblemResponse> {
        const sharedProblemResponse: Omit<ProblemResponse, "problem"> = {
            index: null,
            firstProblemId: null,
            lastProblemId: null,
            nextProblemId: null,
            previousProblemId: null,
            totalProblems: 0,
            error: null,
        };

        if (baseParam !== null) {
            return this.existingProblem$(baseParam.toString()).pipe(map(response => {
                const problem = response?.problem;
                return {
                    ...sharedProblemResponse,
                    problem: {
                        id: null,
                        base: baseParam,
                        hypothesis: problem?.hypothesis ?? "",
                        dataset: Dataset.USER,
                        premises: problem?.premises ?? [],
                        entailmentLabel: EntailmentLabel.UNKNOWN,
                        extraData: null,
                        // KB items are not shared across problems.
                        kbItems: problem?.kbItems.map(kbItem => ({
                            ...kbItem,
                            id: null,
                        })) ?? []
                    }
                };
            }));
        }
        return of<ProblemResponse>({
            ...sharedProblemResponse,
            problem: {
                id: null,
                base: baseParam,
                hypothesis: "",
                dataset: Dataset.USER,
                premises: [],
                entailmentLabel: EntailmentLabel.UNKNOWN,
                extraData: null,
                kbItems: []

            },
        });
    }

    private existingProblem$(problemId?: string, queryParams?: ParamMap): Observable<ProblemResponse | null> {
        const httpParams = queryParams ? this.extractSearchParams(queryParams) : undefined;

        return this.http.get<ProblemResponse>(`/api/problem/${problemId ?? ""}`, { params: httpParams }).pipe(
            catchError((error) => {
                const message = `Error fetching ${problemId ? `problem ${problemId}` : "first problem"}`;
                console.error(message, error);
                return of(null);
            })
        );
    };

    public firstProblemId$ = this.existingProblem$().pipe(
        map(response => response?.problem?.id ?? null),
        shareReplay(1),
    );

    private extractSearchParams(routeParams: ParamMap): HttpParams {
        const text = routeParams.get("text");
        const dataset = routeParams.get("dataset");
        const gold = routeParams.get("gold");
        const entailmentLabel = routeParams.get("entailmentLabel");

        const paramRecord: Record<string, string> = {
            text: text ?? '',
            dataset: dataset ?? '',
            gold: gold ?? '',
            entailmentLabel: entailmentLabel ?? '',
        };

        return new HttpParams({ fromObject: paramRecord });
    }


}
