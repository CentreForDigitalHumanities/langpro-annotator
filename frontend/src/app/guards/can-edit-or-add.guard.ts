import { AuthService } from "@/services/auth.service";
import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn } from "@angular/router";
import { filter, map, take } from "rxjs";

export const CanEditOrAddGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
    const authService = inject(AuthService);

    const editing = route.url.some(segment => segment.path === "edit");
    const adding = route.paramMap.get("problemId") === "new";

    // No need to check permissions if just viewing.
    if (!(editing || adding)) {
        return true;
    }

    return authService.currentUser$.pipe(
        // Wait until we actually have a user (User | null).
        filter(user => user !== undefined),
        take(1),
        map(user => user?.canEditOrAddProblem ?? false),
    );
};
