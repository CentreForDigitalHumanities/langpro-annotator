import { Injectable } from "@angular/core";

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
}
