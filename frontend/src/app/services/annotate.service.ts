import { Injectable } from "@angular/core";
import { catchError, Observable, of, share, Subject, switchMap } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { ProblemResponse, ProofBankStats } from "../types";

@Injectable({
    providedIn: "root",
})
export class AnnotateService {
    public problemId = new Subject<string>();

    public problem$: Observable<ProblemResponse | null> = this.problemId.pipe(
        switchMap((problemId) =>
            this.http.get<ProblemResponse>(`/api/problem/${problemId}`).pipe(
                catchError(() => {
                    console.error("Error fetching problem");
                    return of(null);
                })
            )
        ),
        share()
    );

    public proofBankStats$: Observable<ProofBankStats | null> = this.http
        .get<ProofBankStats>("/api/problem/proofbank-stats")
        .pipe(
            catchError(() => {
                console.error("Error fetching proof bank stats");
                return of(null);
            })
        );

    constructor(private http: HttpClient) {}
}
