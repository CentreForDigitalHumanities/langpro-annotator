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
import { map, switchMap } from "rxjs";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
    selector: "la-navigator",
    standalone: true,
    imports: [FontAwesomeModule, CommonModule],
    templateUrl: "./navigator.component.html",
    styleUrl: "./navigator.component.scss",
})
export class NavigatorComponent {
    public problem$ = this.route.params.pipe(
        map((params) => params["problemId"]),
        switchMap((id) => this.annotateService.problem$(id))
    );
    public proofBankStats$ = this.annotateService.proofBankStats$;

    public faAnglesLeft = faAnglesLeft;
    public faAnglesRight = faAnglesRight;
    public faAngleLeft = faAngleLeft;
    public faAngleRight = faAngleRight;
    public faShuffle = faShuffle;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private annotateService: AnnotateService
    ) {}

    public navigateToProblem(id: string | null | undefined): void {
        if (!id) {
            return;
        }
        this.router.navigate(["/annotate", id]);
    }
}
