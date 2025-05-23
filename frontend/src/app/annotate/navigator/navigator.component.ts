import { Component } from "@angular/core";
import { AnnotateService } from "../../services/annotate.service";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import {
    faAngleLeft,
    faAngleRight,
    faAnglesLeft,
    faAnglesRight,
    faShuffle,
} from "@fortawesome/free-solid-svg-icons";
import { map } from "rxjs";
import { CommonModule } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
import { FracasProblem, ProblemResponse, SickProblem } from "../../types";

@Component({
    selector: "la-navigator",
    standalone: true,
    imports: [FontAwesomeModule, CommonModule],
    templateUrl: "./navigator.component.html",
    styleUrl: "./navigator.component.scss",
})
export class NavigatorComponent {
    private problemId$ = this.route.params.pipe(
        map((params) => params["problemId"])
    );

    public problem$ = this.annotateService.problem$;
    public proofBankStats$ = this.annotateService.proofBankStats$;

    public faAnglesLeft = faAnglesLeft;
    public faAnglesRight = faAnglesRight;
    public faAngleLeft = faAngleLeft;
    public faAngleRight = faAngleRight;
    public faShuffle = faShuffle;

    constructor(
        private route: ActivatedRoute,
        private annotateService: AnnotateService
    ) {}

    ngOnInit(): void {
        this.problemId$.subscribe((problemId) => {
            this.annotateService.navigateToProblem(problemId);
        });
    }

    public navigateToProblem(id: string | null | undefined): void {
        if (!id) {
            return;
        }
        this.annotateService.navigateToProblem(id);
    }

    public getProblemLabel(problem: ProblemResponse): string {
        const type = problem.type;
        let id: string | null = null;
        if (type === 'sick') {
            id = problem.problem?.pairId?.toString() ?? null;
        } else if (type === 'fracas') {
            id = problem.problem?.fracasId?.toString() ?? null;
        }
        return id ? `${type}-${id}` : type;
    }
}
