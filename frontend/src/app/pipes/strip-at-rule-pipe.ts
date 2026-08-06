import { Pipe, PipeTransform } from '@angular/core';

/**
 * Takes a rule as input and returns "" if the rule is "@", which is a very
 * common and trivial rule, and returns the rule unchanged otherwise.
 */
@Pipe({
    name: 'stripAtRule',
    standalone: true
})
export class StripAtRulePipe implements PipeTransform {
    transform(value: string): string {
        return value === '@' ? '' : value;
    }
}
