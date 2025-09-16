import { inject, Injectable } from '@angular/core';
import { filter, map, shareReplay } from 'rxjs';
import { ProblemService } from './problem.service';

export enum AppMode {
    BROWSE = "browse",
    EDIT = "edit",
    ADD = "add",
}

@Injectable({
    providedIn: 'root'
})
export class AppModeService {
    private problemService = inject(ProblemService);

    public viewMode$ = this.problemService.allParams$.pipe(
        filter(allParams => allParams !== null),
        map(({ params, edit }) => {
            if (edit) {
                return AppMode.EDIT;
            }
            if (params.get("problemId") === "new") {
                return AppMode.ADD;
            }
            return AppMode.BROWSE;
        }),
        shareReplay(1)
    );

    public loading$ = this.viewMode$.pipe(map(mode => mode === undefined));
}
