import { ParseInput } from "@/annotate/annotation-input/annotation-input.component";
import { ProblemResponse, SaveProblemResponse, Dataset, EntailmentLabel, Label } from "@/types";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { ParamMap } from "@angular/router";
import { Subject, Observable, switchMap, of, shareReplay, exhaustMap, catchError, map, BehaviorSubject, filter } from "rxjs";
import { ToastService } from "./toast.service";

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
    private toastService = inject(ToastService);

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
            return problemId === "new" ? this.newProblem$() : this.existingProblem$(problemId, queryParams);
        }),
        shareReplay(1)
    );

    public problem$ = this.problemResponse$.pipe(
        map(response => response?.problem ?? null),
        shareReplay(1)
    );

    public allLabels$ = this.http.get<Label[]>('/api/labels').pipe(
        catchError(() => {
            this.toastService.show({
                header: $localize`Error fetching labels`,
                body: $localize`Could not load labels from server.`,
                type: 'danger',
            });
            return of([]);
        }),
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
                    this.toastService.show({
                        header: $localize`Error saving problem`,
                        body: error,
                        type: 'danger',
                    });
                    return of({ id: null, error: 'Failed to save problem' });
                })
            );
        })
    );

    private newProblem$(): Observable<ProblemResponse> {
        return of<ProblemResponse>({
            index: null,
            firstProblemId: null,
            lastProblemId: null,
            nextProblemId: null,
            previousProblemId: null,
            totalProblems: 0,
            error: null,
            problem: {
                id: null,
                hypothesis: "",
                dataset: Dataset.USER,
                premises: [],
                entailmentLabel: EntailmentLabel.UNKNOWN,
                extraData: null,
                kbItems: [],
                labels: [],
            },
        });
    }

    private existingProblem$(problemId?: string, queryParams?: ParamMap): Observable<ProblemResponse | null> {
        const httpParams = queryParams ? this.extractSearchParams(queryParams) : undefined;

        return this.http.get<ProblemResponse>(`/api/problem/${problemId ?? ""}`, { params: httpParams }).pipe(
            catchError((error) => {
                const message = `Error fetching ${problemId ? `problem ${problemId}` : "first problem"}`;
                this.toastService.show({
                    header: message,
                    body: error,
                    type: 'danger',
                });
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
