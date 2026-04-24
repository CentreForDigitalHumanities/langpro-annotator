import { TreeType } from "@/annotate/annotation-parse-results/annotation-parse-results.component";
import { Pipe } from "@angular/core";

const WHITELIST = ["period", "conj"];

@Pipe({
    name: "selectiveUpperCase",
    standalone: true
})
export class SelectiveUpperCasePipe {
    /**
     * Transforms text by converting all content to uppercase, except for items
     * in the whitelist, and only if for the "CCG Tree" type.
     */
    transform(value: string, treeType: TreeType): string {
        if (!value) {
            return value;
        }

        // Only apply selective uppercase transformation for "CCG Tree" type.
        if (treeType !== "CCG Tree") {
            return value;
        }

        // Whitelisted items should be returned in lowercase.
        if (WHITELIST.includes(value.toLocaleLowerCase())) {
            return value.toLocaleLowerCase();
        }

        return value.toLocaleUpperCase();
    }
}
