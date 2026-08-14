import { Component, input } from '@angular/core';
import { EntailmentLabelBadgeComponent } from '../problem-details/entailment-label-badge/entailment-label-badge.component';
import { CommonModule } from '@angular/common';
import { ParseInputForm } from '../annotation-input.component';

@Component({
    selector: 'la-langpro-prediction',
    imports: [EntailmentLabelBadgeComponent, CommonModule],
    templateUrl: './langpro-prediction.component.html',
    styleUrl: './langpro-prediction.component.scss'
})
export class LangProPredictionComponent {
    public form = input.required<ParseInputForm>();;
}
