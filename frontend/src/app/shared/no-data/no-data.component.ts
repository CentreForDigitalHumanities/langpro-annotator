import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'la-no-data',
    templateUrl: './no-data.component.html',
    styleUrl: './no-data.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
})
export class NoDataComponent {
    public readonly dataType = input.required<'parse' | 'proof'>();
}
