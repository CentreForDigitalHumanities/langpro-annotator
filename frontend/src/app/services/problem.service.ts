import { ParseInput } from '@/annotate/annotation-input/annotation-input.component';
import { Dataset, EntailmentLabel, ProblemResponse, ProofBankStats, SaveProblemResponse } from '@/types';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ParamMap } from '@angular/router';
import { Subject, Observable, switchMap, of, catchError, shareReplay, exhaustMap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ProblemService {
    private http = inject(HttpClient);

    public allParams$ = new Subject<{ params: ParamMap, queryParams: ParamMap; }>();

    // Submit a new problem to be saved to the database.
    public submit$ = new Subject<ParseInput>();

    public problem$: Observable<ProblemResponse | null> = this.allParams$.pipe(
        switchMap(({ params, queryParams }) => {
            const problemId = params.get("problemId");
            if (!problemId) {
                return of(null);
            }
            return problemId === "new" ? this.newProblem$() : this.existingProblem$(problemId, queryParams);
        }),
        shareReplay(1)
    );

    public saveProblem$ = this.submit$.pipe(
        exhaustMap((problem) => this.http.post<SaveProblemResponse>('/api/problem/new', problem).pipe(
            catchError((error) => {
                console.error('Error saving problem:', error);
                return of({ id: null, error: 'Failed to save problem' });
            })
        ))
    );

    private newProblem$(): Observable<ProblemResponse> {
        return of<ProblemResponse>({
            id: "new",
            index: null,
            next: null,
            previous: null,
            error: null,
            problem: {
                id: "new",
                hypothesis: "",
                dataset: Dataset.USER,
                premises: [],
                entailmentLabel: EntailmentLabel.UNKNOWN,
                extraData: null,

            },
        });
    }

    private existingProblem$(problemId: string, queryParams: ParamMap): Observable<ProblemResponse | null> {
        const httpParams = this.extractSearchParams(queryParams);

        return this.http.get<ProblemResponse>(`/api/problem/${problemId}`, { params: httpParams }).pipe(
            catchError((error) => {
                console.error(`Error fetching problem ${problemId}:`, error);
                return of(null);
            })
        );
    };

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

    public proofBankStats$: Observable<ProofBankStats | null> = this.http
        .get<ProofBankStats>("/api/problem/proofbank-stats")
        .pipe(
            catchError((error) => {
                console.error(`Error fetching ProofBank stats:`, error);
                return of(null);
            })
        );
}
