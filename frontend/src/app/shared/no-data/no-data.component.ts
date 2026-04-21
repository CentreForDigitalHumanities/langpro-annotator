import { Component, input } from '@angular/core';

@Component({
    selector: 'la-no-data',
    imports: [],
    templateUrl: './no-data.component.html',
    styleUrl: './no-data.component.scss',
    standalone: true,
})
export class NoDataComponent {
    public readonly dataType = input.required<'parse'|'proof'>();
}
