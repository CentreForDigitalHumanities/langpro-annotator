import { Injectable } from "@angular/core";
import {
    catchError,
    Observable,
    of,
    ReplaySubject,
    share,
    switchMap,
} from "rxjs";
import { HttpClient } from "@angular/common/http";
import { ProblemResponse, ProofBankStats } from "../types";


@Injectable({
    providedIn: "root",
})
export class AnnotateService {
    // Global database state
    public firstProblemId: string | null = null;
    public lastProblemId: string | null = null;
    public totalProblems: number = 1000;

    public problemId$ = new ReplaySubject<string>();

    public problem$ = this.problemId$.pipe(
        switchMap((id) => {
            if (!id) {
                console.log("No problem ID provided");
                return of(null);
            }
            return this.http.get<ProblemResponse>(`/api/problem/${id}`).pipe(
                catchError(() => {
                    console.log("Error fetching problem");
                    return of(null);
                })
            );
        }),
        share()
    );

    public proofBankStats$: Observable<ProofBankStats | null> = this.http
        .get<ProofBankStats>("/api/problem/proofbank-stats")
        .pipe(
            catchError(() => {
                console.log("Error fetching proof bank stats");
                return of(null);
            })
        );

    constructor(private http: HttpClient) {}
}
