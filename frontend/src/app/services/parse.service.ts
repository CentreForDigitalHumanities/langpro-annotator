import { ParseInput } from '@/annotate/annotation-input/annotation-input.component';
import { ProblemResponse } from '@/types';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Subject, switchMap, catchError, of, first, Observer } from 'rxjs';

export type ParseResponse = any

@Injectable({
    providedIn: 'root'
})
export class ParseService {
    private http = inject(HttpClient);

    private submit = new Subject<ParseInput>();

    private parse$ = this.submit.pipe(
        switchMap((form) =>
            this.http.post<ParseResponse>("/api/problem/parse", form).pipe(
                catchError((error) => {
                    console.error(`Error parsing problem:`, error);
                    return of(null);
                })
            )
        )
    );

    public startParse(input: ParseInput, handler: (response: ParseResponse) => void) {
        this.parse$.pipe(first()).subscribe(handler);
        this.submit.next(input);
    }
}
