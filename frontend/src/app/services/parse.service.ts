import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Subject, switchMap, catchError, of } from 'rxjs';
import { ParseInput } from '@/annotate/annotation-input/annotation-input.component';

export type ParseResponse = any;

@Injectable({
    providedIn: 'root'
})
export class ParseService {
    private http = inject(HttpClient);

    public submit$ = new Subject<ParseInput>();

    public parse$ = this.submit$.pipe(
        switchMap((form) =>
            this.http.post<ParseResponse>("/api/problem/parse", form).pipe(
                catchError((error) => {
                    console.error(`Error parsing problem:`, error);
                    return of(null);
                })
            )
        )
    );
}
