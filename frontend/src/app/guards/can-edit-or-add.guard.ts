import { AuthService } from "@/services/auth.service";
import { inject } from "@angular/core";
import { CanActivateFn } from "@angular/router";
import { map } from "rxjs";

export const CanEditOrAddGuard: CanActivateFn = () => {
    const authService = inject(AuthService);

    return authService.currentUser$.pipe(
        map(user => user?.canEditOrAddProblem ?? false),
    );
};
