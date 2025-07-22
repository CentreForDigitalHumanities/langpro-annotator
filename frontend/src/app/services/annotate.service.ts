import { Injectable } from "@angular/core";
import {
    catchError,
    Observable,
    of,
    shareReplay,
    Subject,
    switchMap,
} from "rxjs";
import { HttpClient } from "@angular/common/http";
import { ProblemResponse, ProofBankStats } from "../types";
import { AnnotationInput } from "../annotate/annotation-input/annotation-input.component";

@Injectable({
    providedIn: "root",
})
export class AnnotateService {
    public problemId = new Subject<string>();
    public submit = new Subject<AnnotationInput>();

    public problem$: Observable<ProblemResponse | null> = this.problemId.pipe(
        switchMap((problemId) =>
            this.http.get<ProblemResponse>(`/api/problem/${problemId}`).pipe(
                catchError(() => {
                    console.error("Error fetching problem");
                    return of(null);
                })
            )
        ),
        shareReplay(1)
    );

    public proofBankStats$: Observable<ProofBankStats | null> = this.http
        .get<ProofBankStats>("/api/problem/proofbank-stats")
        .pipe(
            catchError(() => {
                console.error("Error fetching ProofBank stats");
                return of(null);
            })
        );

    public parse$ = this.submit.pipe(
        switchMap((form) =>
            this.http
                .post<ProblemResponse>("/api/problem/parse", {
                    data: form,
                })
                .pipe(
                    catchError(() => {
                        console.error("Error parsing results");
                        return of(null);
                    })
                )
        )
    );

    constructor(private http: HttpClient) {}
}
