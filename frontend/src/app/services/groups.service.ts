import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { Group } from '../models/group.model'; // Adjust path if necessary
import { AuthService } from './auth.service'; // Assuming AuthService exists
import { environment } from '../../environments/environment'; // Assuming environment setup

@Injectable({
  providedIn: 'root'
})
export class GroupsService {
  private baseApiUrl = `${environment.apiUrl}/groups`; // Base API URL for groups

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Fetch groups the current user is a member of
  getMyGroups(): Observable<Group[]> {
    return from(this.authService.getAuthToken()).pipe(
      switchMap(token => {
        if (!token) {
          return throwError(() => new Error('Authentication token not available.'));
        }
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        const url = `${this.baseApiUrl}/my`;
        return this.http.get<Group[]>(url, { headers });
      }),
      catchError(this.handleError)
    );
  }

  // Add method for creating a group
  createGroup(groupData: { name: string; description?: string; visibility: 'public' | 'private' }): Observable<Group> {
    return from(this.authService.getAuthToken()).pipe(
      switchMap(token => {
        if (!token) {
          return throwError(() => new Error('Authentication token not available.'));
        }
        const headers = new HttpHeaders()
          .set('Authorization', `Bearer ${token}`)
          .set('Content-Type', 'application/json');
        return this.http.post<Group>(this.baseApiUrl, groupData, { headers });
      }),
      catchError(this.handleError)
    );
  }

  // Placeholder for other group methods (getById, update, delete, addMember, etc.)

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    // Basic error message handling, enhance as needed
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.error && typeof error.error === 'object' && error.error.message) {
       // Backend returned a specific error message
        errorMessage = `${error.status}: ${error.error.message}`;
    } else {
      // Generic backend error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
} 