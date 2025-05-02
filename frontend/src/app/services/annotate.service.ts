import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";

interface Premises {
    premises: string[];
    conclusion: string;
}

@Injectable({
    providedIn: "root",
})
export class AnnotateService {
    public currentProblemId: string = "problem1";
    public totalProblems: number = 1000;
    public currentProblemIndex: number = 0;

    constructor() {}

    public navigateToProblem(id: string): void {
        console.log("Navigating to problem!", id);
    }

    public getPremises(): Observable<Premises> {
        return of({
            premises: [
                "All Italian men want to be a great tenor.",
                "Pavarotti is an Italian man.",
            ],
            conclusion: "Pavarotti wants to be a great tenor.",
        });
    }
}
