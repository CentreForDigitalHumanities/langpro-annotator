import { ParseInput } from "@/annotate/annotation-input/annotation-input.component";
import extractBaseParam from "@/shared/extractBaseParam";
import { ProblemResponse, SaveProblemResponse, Dataset, EntailmentLabel, Problem, Label, ToggleVisibilityInput, ToggleGoldInput, ProblemStatus } from "@/types";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { ParamMap } from "@angular/router";
import { Subject, Observable, switchMap, of, shareReplay, exhaustMap, catchError, map, BehaviorSubject, filter, merge } from "rxjs";
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
    public refetchProblem$ = new Subject<void>();
    public toggleVisibility$ = new Subject<ToggleVisibilityInput & { id: number; }>();
    public toggleGold$ = new Subject<ToggleGoldInput & { id: number; }>();

    private visibilityToggleSuccess$ = this.toggleVisibility$.pipe(
        exhaustMap(({ id, hidden }) =>
            this.http.post<ToggleVisibilityInput>(`/api/problem/${id}/set-visibility/`, { hidden }).pipe(
                catchError((error) => {
                    this.toastService.show({
                        header: $localize`Error updating visibility`,
                        body: error.message || $localize`Could not update problem visibility.`,
                        type: 'danger',
                    });
                    return of(null);
                })
            )
        ),
        filter(result => result !== null),
        map(() => this.allParams$.value),
    );

    private goldToggleSuccess$ = this.toggleGold$.pipe(
        exhaustMap(({ id, gold }) =>
            this.http.post<ToggleGoldInput>(`/api/problem/${id}/set-status/`, { gold }).pipe(
                catchError((error) => {
                    this.toastService.show({
                        header: $localize`Error updating status`,
                        body: error.message || $localize`Could not update problem status.`,
                        type: 'danger',
                    });
                    return of(null);
                })
            )
        ),
        filter(result => result !== null),
        map(() => this.allParams$.value),
    );

    public problemResponse$: Observable<ProblemResponse | null> = merge(
        this.allParams$,
        this.refetchProblem$.pipe(map(() => this.allParams$.value)),
        this.visibilityToggleSuccess$,
        this.goldToggleSuccess$,
    ).pipe(
        filter(allParams => allParams !== null),
        switchMap(({ params, queryParams }) => {
            const problemId = params.get("problemId");
            if (!problemId) {
                return of(null);
            }
            const baseParam = extractBaseParam(queryParams);

            return problemId === "new" ? this.newProblem$(baseParam) : this.existingProblem$(problemId, queryParams);
        }),
        shareReplay(1)
    );


    public problem$ = this.problemResponse$.pipe(
        map(response => response?.problem ?? null),
        shareReplay(1)
    );

    public allLabels$: Observable<Label[]> = this.http.get<Label[]>('/api/label/').pipe(
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
            const action = problem.id ? this.http.patch<SaveProblemResponse>(`/api/problem/${problem.id}/`, problem) :
                this.http.post<SaveProblemResponse>(`/api/problem/`, problem);
            return action.pipe(
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

    private newProblem$(baseParam: number | null): Observable<ProblemResponse> {
        if (baseParam !== null) {
            return this.existingProblem$(baseParam.toString())
                .pipe(
                    map(response => this.createNewProblemResponse(baseParam, response?.problem))
                );
        }
        return of<ProblemResponse>(this.createNewProblemResponse());
    }

    private createNewProblemResponse(baseParam?: number, existingProblem?: Problem | null): ProblemResponse {
        const sharedProblemResponse: Omit<ProblemResponse, "problem"> = {
            index: null,
            first: null,
            last: null,
            next: null,
            previous: null,
            total: 0,
            error: null,
        };

        return {
            ...sharedProblemResponse,
            problem: {
                id: null,
                base: baseParam ?? null,
                hypothesis: existingProblem?.hypothesis ?? "",
                dataset: Dataset.USER,
                premises: existingProblem?.premises ?? [],
                entailmentLabel: EntailmentLabel.UNKNOWN,
                hidden: false,
                gold: false,
                status: ProblemStatus.BRONZE,
                extraData: null,
                kbAnnotations: existingProblem?.kbAnnotations.map(annotation => ({
                    ...annotation, id: null,
                })) ?? [],
                labelAnnotations: existingProblem?.labelAnnotations.map(annotation => ({
                    ...annotation,
                    id: null,
                })) ?? [],
            }
        };
    }

    private existingProblem$(problemId?: string, queryParams?: ParamMap): Observable<ProblemResponse | null> {
        const httpParams = queryParams ? this.extractSearchParams(queryParams) : undefined;

        return this.http.get<ProblemResponse>(`/api/problem/${problemId ?? "first"}/`, { params: httpParams }).pipe(
            catchError((error) => {
                const message = `Error fetching ${problemId ? `problem ${problemId}` : "first problem"}`;
                this.toastService.show({
                    header: message,
                    body: error.message || 'The problem could not be fetched from the server.',
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
        const status = routeParams.get("status");
        const entailmentLabel = routeParams.get("entailmentLabel");
        const hidden = routeParams.get("hidden");

        const paramRecord: Record<string, string> = {
            text: text ?? '',
            dataset: dataset ?? '',
            status: status ?? '',
            entailmentLabel: entailmentLabel ?? '',
            hidden: hidden ?? '',
        };

        return new HttpParams({ fromObject: paramRecord });
    }
}
