import { Component, DestroyRef } from "@angular/core";
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
import { ActivatedRoute, Router } from "@angular/router";
import { ProblemResponse } from "../../types";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

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
        private destroyRef: DestroyRef,
        private router: Router,
        private route: ActivatedRoute,
        private annotateService: AnnotateService
    ) {}

    ngOnInit(): void {
        this.route.params.pipe(
            map((params) => params["problemId"]),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe((problemId) => {
            if (!problemId) {
                return;
            }
            this.annotateService.problemId$.next(problemId);
        });
    }

    public navigateToProblem(id: string | null | undefined): void {
        if (!id) {
            return;
        }
        this.router.navigate(["/annotate", id]);
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
