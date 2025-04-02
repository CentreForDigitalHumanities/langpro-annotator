import { Component, EventEmitter, Input, Output } from "@angular/core";
import { AnnotateService } from "../../services/annotate.service";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import {
    faAngleLeft,
    faAngleRight,
    faAnglesLeft,
    faAnglesRight,
    faShuffle,
} from "@fortawesome/free-solid-svg-icons";

@Component({
    selector: "la-navigator",
    standalone: true,
    imports: [FontAwesomeModule],
    templateUrl: "./navigator.component.html",
    styleUrl: "./navigator.component.scss",
})
export class NavigatorComponent {
    public isFirstProblem = false;
    public isLastProblem = false;

    public currentProblemId = this.annotateService.currentProblemId;
    public totalProblems = this.annotateService.totalProblems;
    public currentProblemIndex = this.annotateService.currentProblemIndex;

    public faAnglesLeft = faAnglesLeft;
    public faAnglesRight = faAnglesRight;
    public faAngleLeft = faAngleLeft;
    public faAngleRight = faAngleRight;
    public faShuffle = faShuffle;

    constructor(private annotateService: AnnotateService) {}

    public goToFirst(): void {
        console.log("Going to first problem!");
    }

    public goToLast(): void {
        console.log("Going to last problem!");
    }

    public goToNext(): void {
        console.log("Going to next problem!");
    }

    public goToPrevious(): void {
        console.log("Going to previous problem!");
    }

    public goToRandom(): void {
        console.log("Going to random problem!");
    }
}
