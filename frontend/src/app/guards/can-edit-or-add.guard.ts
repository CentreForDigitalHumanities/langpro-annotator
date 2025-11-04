import { AuthService } from "@/services/auth.service";
import { inject } from "@angular/core";
import { CanActivateFn } from "@angular/router";
import { filter, map, take } from "rxjs";

export const CanEditOrAddGuard: CanActivateFn = () => {
    const authService = inject(AuthService);

    return authService.currentUser$.pipe(
        // Wait until we actually have a user (User | null).
        filter(user => user !== undefined),
        take(1),
        map(user => user?.canEditOrAddProblem ?? false),
    );
};
