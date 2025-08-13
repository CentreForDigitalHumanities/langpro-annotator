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

            return this.http.get<ProblemResponse>(`/api/problem/${problemId}`, { params: httpParams }).pipe(
                catchError((error) => {
                    console.error(`Error fetching problem ${problemId}:`, error);
                    return of(null);
                })
            );
        }),
        shareReplay(1)
    );

    private extractSearchParams(routeParams: ParamMap): HttpParams {
        const text = routeParams.get("text");
        const dataset = routeParams.get("dataset");
        const gold = routeParams.get("gold");
        const entailmentLabel = routeParams.get("entailmentLabel");

        const paramRecord: Record<string, string> = {};

        if (text) {
            paramRecord["search"] = text;
        }
        if (dataset) {
            paramRecord["dataset"] = dataset;
        }
        if (gold) {
            paramRecord["gold"] = gold;
        }
        if (entailmentLabel) {
            paramRecord["entailmentLabel"] = entailmentLabel;
        }

        return new HttpParams({ fromObject: paramRecord });
    }

    // Retrieves the ID of the first available problem so we can link to it
    // from the main navigation bar.
    public getFirstProblemId$ = this.http.get<{ firstProblemId: string | null; }>("/api/problem/entry").pipe(
        map(response => response.firstProblemId),
        catchError((error) => {
            console.error("Error fetching first problem ID:", error);
            return of(null);
        })
    );
}
