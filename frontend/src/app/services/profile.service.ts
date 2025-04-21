import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, switchMap, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service'; // Import AuthService
import { UserProfile } from '../interfaces/user-profile.interface';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = '/api/users/profile'; // Adjust if your backend proxy is configured differently

  // Helper to get auth headers
  private getAuthHeaders(): Observable<HttpHeaders> {
    return from(this.authService.getIdToken()).pipe(
      switchMap(token => {
        if (!token) {
          return throwError(() => new Error('No authentication token found.'));
        }
        return of(new HttpHeaders().set('Authorization', `Bearer ${token}`));
      })
    );
  }

  /**
   * Fetches the profile of the currently authenticated user.
   */
  getProfile(): Observable<UserProfile> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        return this.http.get<UserProfile>(this.apiUrl, { headers });
      }),
      catchError(error => {
        console.error('Error fetching user profile:', error);
        // Consider returning a more specific error message based on status code
        return throwError(() => new Error('Failed to fetch user profile.'));
      })
    );
  }

  /**
   * Updates the profile of the currently authenticated user.
   * @param data Partial profile data to update.
   */
  updateProfile(data: Partial<UserProfile>): Observable<void> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        return this.http.put<void>(this.apiUrl, data, { headers });
      }),
      catchError(error => {
        console.error('Error updating user profile:', error);
        // Consider returning a more specific error message based on status code
        return throwError(() => new Error('Failed to update user profile.'));
      })
    );
  }
} 