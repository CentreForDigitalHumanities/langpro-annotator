import { ParseService } from '@/services/parse.service';
import { Component, inject, input } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { EntailmentLabelBadgeComponent } from '../problem-details/entailment-label-badge/entailment-label-badge.component';
import { CommonModule } from '@angular/common';
import { merge, map, switchMap } from 'rxjs';
import { ParseInputForm } from '../annotation-input.component';

@Component({
    selector: 'la-langpro-prediction',
    imports: [EntailmentLabelBadgeComponent, CommonModule],
    templateUrl: './langpro-prediction.component.html',
    styleUrl: './langpro-prediction.component.scss'
})
export class LangProPredictionComponent {
    private parseService = inject(ParseService);

    public form = input.required<ParseInputForm>();

    public langproPrediction$ = merge(
        this.parseService.parse$.pipe(
            map(parse => parse?.data?.langpro_prediction ?? null)
        ),
        // Empty the prediction when the user modifies the problem, since the
        // prediction is only valid for the problem value.
        toObservable(this.form).pipe(
            switchMap(form => form.valueChanges),
            map(() => null),
        ),
    );

}
