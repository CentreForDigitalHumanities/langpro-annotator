import { ParamMap } from "@angular/router";

/**
 * Extracts the base parameter from query parameters and returns it as a number.
 * @param queryParams - The query parameters map to extract the base value from.
 * @returns The base value as a number, or null if the base parameter is not present.
 */
export default function extractBaseParam(queryParams: ParamMap): number | null {
    const baseStr = queryParams.get("base");
    if (!baseStr) {
        return null;
    }
    return parseInt(baseStr, 10);
}
