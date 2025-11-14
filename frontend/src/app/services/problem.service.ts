import { ProblemResponse } from '@/types';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ParamMap } from '@angular/router';
import { Subject, Observable, switchMap, of, catchError, shareReplay, map } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ProblemService {
    private http = inject(HttpClient);

    public allParams$ = new Subject<{ params: ParamMap, queryParams: ParamMap; }>();

    public problem$: Observable<ProblemResponse | null> = this.allParams$.pipe(
        switchMap(({ params, queryParams }) => {
            const problemId = params.get("problemId");
            if (!problemId) {
                return of(null);
            }

            const httpParams = this.extractSearchParams(queryParams);

            return this.queryProblem$(problemId, httpParams);
        }),
        shareReplay(1)
    );

    public getFirstProblemId$ = this.queryProblem$().pipe(
        map(problem => problem?.id ?? null)
    );

    private queryProblem$(problemId?: string, httpParams?: HttpParams) {
        return this.http.get<ProblemResponse>(`/api/problem/${problemId ?? ""}`, { params: httpParams }).pipe(
            catchError((error) => {
                const message = `Error fetching ${problemId ? `problem ${problemId}` : "first problem"}`;
                console.error(message, error);
                return of(null);
            })
        );
    }

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

    public save(problemId: number, annotation: any) {
        return this.http.post(`/api/problem/${problemId}`, annotation);
    }
}
