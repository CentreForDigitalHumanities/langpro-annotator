import { ProblemService } from '@/services/problem.service';
import { Problem } from '@/types';
import { Component, inject, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'la-visibility-toggle',
    imports: [FontAwesomeModule, NgbTooltipModule],
    templateUrl: './visibility-toggle.component.html',
    styleUrl: './visibility-toggle.component.scss'
})
export class VisibilityToggleComponent {
    public readonly problem = input.required<Problem>();
    private problemService = inject(ProblemService);

    public faEye = faEye;
    public faEyeSlash = faEyeSlash;

    public onToggleHidden(): void {
        const problem = this.problem();
        if (!problem?.id) {
            return;
        }
        this.problemService.toggleVisibility$.next({ id: problem.id, hidden: !problem.hidden });
    }

}
