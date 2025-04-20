import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth'; // Import AngularFire Auth services
import { map, take, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

/**
 * Functional route guard that checks if a user is authenticated using Firebase Auth.
 * Redirects to the '/login' route if the user is not authenticated.
 */
export const authGuard: CanActivateFn = (route, state): Observable<boolean> => {
  const auth: Auth = inject(Auth);
  const router: Router = inject(Router);

  return authState(auth).pipe(
    take(1), // Take the first emission (current auth state) and complete
    map(user => !!user), // Map the user object to a boolean (true if user exists, false otherwise)
    tap(isAuthenticated => {
      if (!isAuthenticated) {
        console.log('AuthGuard: User not authenticated, redirecting to login.');
        router.navigate(['/login']); // Redirect to login route if not authenticated
      }
    })
  );
};
