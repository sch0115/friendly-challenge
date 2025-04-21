import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs'; // Import 'of' for mock data and 'throwError' for error handling
import { catchError } from 'rxjs/operators';
import { Group } from '../models/group.model';

@Injectable({
  providedIn: 'root'
})
export class GroupsService {
  // TODO: Replace with actual API endpoint from environment variables
  private apiUrl = '/api/groups'; // Example base API URL

  constructor(private http: HttpClient) { }

  // Fetch groups the current user is a member of
  getMyGroups(): Observable<Group[]> {
    // Mock data for now
    const mockGroups: Group[] = [
      { id: '1', name: 'Study Group Alpha', description: 'Weekly review sessions', visibility: 'public', membersCount: 5 },
      { id: '2', name: 'Project Phoenix Team', members: ['Alice', 'Bob'], visibility: 'private', membersCount: 2 },
      { id: '3', name: 'Book Club', description: 'Discussing sci-fi classics', visibility: 'public', membersCount: 10 }
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

  // Fetch a single group by its ID
  getGroupById(groupId: string): Observable<Group> {
    // Mock data for now
    const mockGroups: Group[] = [
      { id: '1', name: 'Study Group Alpha', description: 'Weekly review sessions', visibility: 'public', membersCount: 5 },
      { id: '2', name: 'Project Phoenix Team', members: ['Alice', 'Bob'], visibility: 'private', membersCount: 2 },
      { id: '3', name: 'Book Club', description: 'Discussing sci-fi classics', visibility: 'public', membersCount: 10 }
    ];
    const group = mockGroups.find(g => g.id === groupId);
    if (!group) {
      return throwError(() => new Error(`Group with ID ${groupId} not found`)); // Simulate not found
    }
    return of(group).pipe(
      catchError(this.handleError<Group>(`getGroupById id=${groupId}`))
    );
    // Actual API call example:
    // const url = `${this.apiUrl}/${groupId}`;
    // return this.http.get<Group>(url).pipe(
    //   catchError(this.handleError<Group>(`getGroupById id=${groupId}`))
    // );
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