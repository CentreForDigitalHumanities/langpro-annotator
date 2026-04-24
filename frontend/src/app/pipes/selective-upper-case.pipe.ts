import { Pipe } from "@angular/core";

const WHITELIST = ["period", "conj"];

@Pipe({
    name: "selectiveUpperCase",
    standalone: true
})
export class SelectiveUpperCasePipe {
    /**
     * Transforms text by converting all content to uppercase, except for items
     * in the whitelist.
     */
    transform(value: string): string {
        if (!value) {
            return value;
        }

        // Whitelisted items should be returned in lowercase.
        if (WHITELIST.includes(value.toLocaleLowerCase())) {
            return value.toLocaleLowerCase();
        }

        return value.toLocaleUpperCase();
    }
}
