import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service'; // Adjust path if needed
import { switchMap, take } from 'rxjs/operators';
import { from } from 'rxjs';

/**
 * Functional HTTP interceptor that automatically attaches the Firebase ID token
 * to outgoing requests if the user is authenticated.
 */
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);

  // Check if the request URL is for our backend API (adjust the URL check as needed)
  // For now, let's assume all relative URLs or URLs starting with /api are for our backend
  const isApiUrl = req.url.startsWith('/') || req.url.startsWith('http://localhost:3000'); // Example, refine this

  if (!isApiUrl) {
    // If it's not an API call, pass the request through without modification
    return next(req);
  }

  // Get the ID token asynchronously
  return from(authService.getIdToken()).pipe(
    take(1), // Ensure we only take the first emission
    switchMap(token => {
      if (token) {
        // If token exists, clone the request and add the Authorization header
        const clonedReq = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${token}`)
        });
        console.log('AuthInterceptor: Attaching token to request');
        return next(clonedReq);
      } else {
        // If no token (user not logged in), proceed with the original request
        console.log('AuthInterceptor: No token found, skipping attachment');
        return next(req);
      }
    })
  );
};
