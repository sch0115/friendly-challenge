import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs'; // Import 'of' for mock data
import { catchError } from 'rxjs/operators';
import { Group } from '../models/group.model';

@Injectable({
  providedIn: 'root'
})
export class GroupsService {
  // private apiUrl = '/api/groups'; // Replace with actual API endpoint

  constructor(private http: HttpClient) { }

  // Replace with actual API call
  getMyGroups(): Observable<Group[]> {
    // Mock data for now
    const mockGroups: Group[] = [
      { id: '1', name: 'Study Group Alpha', description: 'Weekly review sessions' },
      { id: '2', name: 'Project Phoenix Team', members: ['Alice', 'Bob'] },
      { id: '3', name: 'Book Club', description: 'Discussing sci-fi classics' }
    ];
    return of(mockGroups).pipe(
      catchError(this.handleError<Group[]>('getMyGroups', []))
    );
    // Actual API call example:
    // return this.http.get<Group[]>(`${this.apiUrl}/my`)
    //   .pipe(
    //     catchError(this.handleError<Group[]>('getMyGroups', []))
    //   );
  }

  // Basic error handling (can be expanded)
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`); // Log to console
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
} 