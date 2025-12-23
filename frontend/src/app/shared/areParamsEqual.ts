import { ParamMap } from "@angular/router";

/**
 * Compares two sets of route parameters and query parameters and an 'edit'
 * flag to determine if they are equal.
 *
 * @param oldParams - A tuple containing the previous route parameters, query
 * parameters, and edit flag.
 * @param newParams - A tuple containing the new route parameters, query
 * parameters, and edit flag.
 * @returns `true` if all parameters and query parameters are equal and the
 * edit flags match, otherwise `false`.
 */
export default function areParamsEqual(
    [oldParams, oldQueryParams, oldEditParam]: [ParamMap, ParamMap, boolean],
    [newParams, newQueryParams, newEditParam]: [ParamMap, ParamMap, boolean]
): boolean {
    const compareMaps = (map1: ParamMap, map2: ParamMap) => {
        if (map1.keys.length !== map2.keys.length) {
            return false;
        }
        return map1.keys.every((key: string) => map1.get(key) === map2.get(key));
    };

    return (
        compareMaps(oldParams, newParams) &&
        compareMaps(oldQueryParams, newQueryParams) &&
        oldEditParam === newEditParam
    );
}
