import { Pipe, PipeTransform } from '@angular/core';

const wrapInSubscript = (_: string, p1: string, p2: string) => `<sub>${p1.toLocaleLowerCase()}</sub>${p2}`;

@Pipe({
    name: 'subscript',
    standalone: true
})
export class SubscriptPipe implements PipeTransform {
    /**
     * Transforms text by converting all content in between a colon and a
     * slash, a parenthesis, a hyphen or the end of the string to subscript.
     * Example: "np:dcl\nb" becomes "np<sub>dcl</sub>nb"
     */
    transform(value: string): string {
        if (!value) {
            return value;
        }

        return value.replace(/:(.*?)(\\|\/|$|\)|\(|-)/g, wrapInSubscript);

    }
}
