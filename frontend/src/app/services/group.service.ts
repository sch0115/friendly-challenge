import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, from, switchMap, catchError } from 'rxjs';
import { CreateActivityDto } from '../../../src/activities/dto/create-activity.dto'; // Adjust path
import { UpdateActivityDto } from '../../../src/activities/dto/update-activity.dto'; // Adjust path
import { Activity } from '../../../src/models/activity.model'; // Adjust path
import { AuthService } from './auth.service'; // Assuming AuthService exists
import { environment } from '../../environments/environment'; // Assuming environment setup

@Injectable({
  providedIn: 'root'
})
export class ActivitiesService { // Renamed from GroupService for clarity
  private baseApiUrl = environment.apiUrl; // Base API URL

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Create Activity
  createActivity(groupId: string, activityData: CreateActivityDto): Observable<Activity> {
    return from(this.authService.getAuthToken()).pipe(
      switchMap(token => {
        if (!token) return throwError(() => new Error('Token not available'));
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        const url = `${this.baseApiUrl}/groups/${groupId}/activities`;
        return this.http.post<Activity>(url, activityData, { headers });
      }),
      catchError(this.handleError)
    );
  }

  // Get Activities for a Group
  getActivitiesByGroup(groupId: string): Observable<Activity[]> {
     return from(this.authService.getAuthToken()).pipe(
      switchMap(token => {
        if (!token) return throwError(() => new Error('Token not available'));
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        const url = `${this.baseApiUrl}/groups/${groupId}/activities`;
        return this.http.get<Activity[]>(url, { headers });
      }),
      catchError(this.handleError)
    );
  }

  // Update Activity
  updateActivity(groupId: string, activityId: string, activityData: UpdateActivityDto): Observable<Activity> {
      return from(this.authService.getAuthToken()).pipe(
      switchMap(token => {
        if (!token) return throwError(() => new Error('Token not available'));
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        const url = `${this.baseApiUrl}/groups/${groupId}/activities/${activityId}`;
        return this.http.put<Activity>(url, activityData, { headers });
      }),
      catchError(this.handleError)
    );
  }

  // Delete Activity
  deleteActivity(groupId: string, activityId: string): Observable<void> {
     return from(this.authService.getAuthToken()).pipe(
      switchMap(token => {
        if (!token) return throwError(() => new Error('Token not available'));
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        const url = `${this.baseApiUrl}/groups/${groupId}/activities/${activityId}`;
        return this.http.delete<void>(url, { headers });
      }),
      catchError(this.handleError)
    );
  }


  // Basic error handler (copied from previous service example)
  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error && typeof error.error === 'object' && error.error.message) {
        errorMessage = `${error.status}: ${error.error.message}`;
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}
