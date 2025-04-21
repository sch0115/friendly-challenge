import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, from, switchMap, catchError } from 'rxjs';
import { CreateGroupDto } from '../../../src/groups/dto/create-group.dto'; // Adjust path as needed
import { Group } from '../../../src/models/group.model'; // Adjust path as needed
import { AuthService } from './auth.service'; // Assuming AuthService exists
import { environment } from '../../environments/environment'; // Assuming environment setup

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private apiUrl = `${environment.apiUrl}/groups`; // Get API URL from environment

  constructor(
    private http: HttpClient,
    private authService: AuthService // Inject AuthService
  ) { }

  createGroup(groupData: CreateGroupDto): Observable<Group> {
    // Get the auth token first, then make the API call
    return from(this.authService.getAuthToken()).pipe(
      switchMap(token => {
        if (!token) {
          return throwError(() => new Error('Authentication token not available.'));
        }
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post<Group>(this.apiUrl, groupData, { headers });
      }),
      catchError(this.handleError)
    );
  }

  // Basic error handler
  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error && typeof error.error === 'object' && error.error.message) {
        errorMessage = `${error.status}: ${error.error.message}`;
      }
    }
    return throwError(() => new Error(errorMessage));
  }

  // Add other methods later (getGroup, updateGroup, etc.)
}
