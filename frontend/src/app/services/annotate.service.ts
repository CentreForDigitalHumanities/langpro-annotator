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
                catchError((error) => {
                    console.error(`Error fetching problem ${problemId}:`, error);
                    return of(null);
                })
            )
        ),
        shareReplay(1)
    );

    public proofBankStats$: Observable<ProofBankStats | null> = this.http
        .get<ProofBankStats>("/api/problem/proofbank-stats")
        .pipe(
            catchError((error) => {
                console.error(`Error fetching ProofBank stats:`, error);
                return of(null);
            })
        );

    public parse$ = this.submit.pipe(
        switchMap((form) =>
            this.http.post<ProblemResponse>("/api/problem/parse", form).pipe(
                catchError((error) => {
                    console.error(`Error parsing problem:`, error);
                    return of(null);
                })
            )
        )
    );

    constructor(private http: HttpClient) {}
}
