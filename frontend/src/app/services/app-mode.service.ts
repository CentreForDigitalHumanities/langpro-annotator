import { inject, Injectable } from '@angular/core';
import { Observable, map, startWith } from 'rxjs';
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

    private viewMode$: Observable<AppMode | undefined> = this.problemService.problem$.pipe(
        map(problem => {
            if (problem?.id === "new") {
                return AppMode.ADD;
            }
            return AppMode.BROWSE;
        }),
        startWith(undefined)
    );

    public browsing$ = this.viewMode$.pipe(map(mode => mode === AppMode.BROWSE));
    public adding$ = this.viewMode$.pipe(map(mode => mode === AppMode.ADD));
    public editing$ = this.viewMode$.pipe(map(mode => mode === AppMode.EDIT));
    public loading$ = this.viewMode$.pipe(map(mode => mode === undefined));
}
