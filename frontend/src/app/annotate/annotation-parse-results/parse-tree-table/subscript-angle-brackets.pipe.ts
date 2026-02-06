import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'subscriptAngleBrackets',
    standalone: true
})
export class SubscriptAngleBracketsPipe implements PipeTransform {
    /**
     * Transforms text by converting content within angle brackets <...> to subscript.
     * Example: "NP<nb>" becomes "NP<sub>nb</sub>"
     */
    transform(value: string): string {
        if (!value) {
            return value;
        }

        // Replace <...> with <sub>...</sub>
        return value.replace(/<([^>]+)>/g, '<sub>$1</sub>');
    }
}
