import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Subject, switchMap, catchError, of, merge, map } from 'rxjs';
import { ParseInput } from '@/annotate/annotation-input/annotation-input.component';
import { ParseResponseData } from '@/annotate/annotation-parse-results/types';
import { ProblemService } from './problem.service';


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
}
