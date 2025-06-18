import { Injectable } from "@angular/core";
import {
    catchError,
    Observable,
    of,
} from "rxjs";
import { HttpClient } from "@angular/common/http";
import { ProblemResponse, ProofBankStats } from "../types";

@Injectable({
    providedIn: "root",
})
export class AnnotateService {
    public problem$(problemId: string): Observable<ProblemResponse | null> {
        if (!problemId) {
            console.log("No problem ID provided");
            return of(null);
        }
        return this.http.get<ProblemResponse>(`/api/problem/${problemId}`).pipe(
            catchError(() => {
                console.log("Error fetching problem");
                return of(null);
            })
        );
    }

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
