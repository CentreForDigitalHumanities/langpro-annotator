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
import { IconButtonComponent } from "@/shared/icon-button/icon-button.component";

@Component({
    selector: "la-navigator",
    standalone: true,
    imports: [FontAwesomeModule, CommonModule, IconButtonComponent],
    templateUrl: "./navigator.component.html",
    styleUrl: "./navigator.component.scss",
})
export class NavigatorComponent {
    private router = inject(Router);
    private problemService = inject(ProblemService);

    public problemResponse$ = this.problemService.problemResponse$;

    public faAnglesLeft = faAnglesLeft;
    public faAnglesRight = faAnglesRight;
    public faAngleLeft = faAngleLeft;
    public faAngleRight = faAngleRight;
    public faShuffle = faShuffle;

    public navigateToProblem(id: number | null | undefined): void {
        if (!id) {
            return;
        }
        this.router.navigate(["/annotate", id], {
            queryParamsHandling: "preserve",
        });
    }
}
