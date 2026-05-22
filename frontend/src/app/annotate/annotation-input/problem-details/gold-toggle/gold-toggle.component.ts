import { ProblemService } from '@/services/problem.service';
import { Problem } from '@/types';
import { Component, inject, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMedal } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'la-gold-toggle',
    imports: [FontAwesomeModule],
    templateUrl: './gold-toggle.component.html',
    styleUrl: './gold-toggle.component.scss'
})
export class GoldToggleComponent {
    public readonly problem = input.required<Problem>();
    private problemService = inject(ProblemService);

    public faMedal = faMedal;

    public onToggleGold(): void {
        const problem = this.problem();
        if (!problem?.id) {
            return;
        }
        this.problemService.toggleGold$.next({ id: problem.id, gold: !problem.gold });
    }
}
