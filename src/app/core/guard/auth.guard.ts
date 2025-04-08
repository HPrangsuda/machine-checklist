import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../service/auth.service';

export const AuthGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean> | Promise<boolean> | boolean => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = authService.isAuthenticated();


  if (isAuthenticated) {
    return true;
  } else {
    const returnUrl = state.url;
    console.log('AuthGuard redirecting to /signin with returnUrl:', returnUrl);
    router.navigate(['/signin'], { queryParams: { returnUrl: encodeURIComponent(returnUrl) } });
    return false;
  }
};