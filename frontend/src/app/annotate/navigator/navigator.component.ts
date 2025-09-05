import { Component, inject } from "@angular/core";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import {
    faAngleLeft,
    faAngleRight,
    faAnglesLeft,
    faAnglesRight,
    faShuffle,
} from "@fortawesome/free-solid-svg-icons";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { ProblemService } from "@/services/problem.service";

@Component({
    selector: "la-navigator",
    standalone: true,
    imports: [FontAwesomeModule, CommonModule],
    templateUrl: "./navigator.component.html",
    styleUrl: "./navigator.component.scss",
})
export class NavigatorComponent {
    private router = inject(Router);
    private problemService = inject(ProblemService);

    public problem$ = this.problemService.problem$;

    public faAnglesLeft = faAnglesLeft;
    public faAnglesRight = faAnglesRight;
    public faAngleLeft = faAngleLeft;
    public faAngleRight = faAngleRight;
    public faShuffle = faShuffle;

    public navigateToProblem(id: string | null | undefined): void {
        if (!id) {
            return;
        }
        this.router.navigate(["/annotate", id], {
            queryParamsHandling: "preserve"
        });
    }
}
