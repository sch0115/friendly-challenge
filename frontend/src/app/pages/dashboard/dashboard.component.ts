import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject, of, catchError, takeUntil, tap, finalize } from 'rxjs';
import { Group } from '../../core/models/group.model';
import { GroupsService } from '../../core/services/groups.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  myGroups$!: Observable<Group[]>; // Use definite assignment assertion
  isLoading: boolean = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(private groupsService: GroupsService, private router: Router) {}

  ngOnInit(): void {
    this.loadGroups();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadGroups(): void {
    this.isLoading = true;
    this.error = null;
    this.myGroups$ = this.groupsService.getMyGroups().pipe(
      tap(() => {
        // Optionally, could set isLoading false here if success is guaranteed by observable completion
        // However, finalize ensures it happens regardless of error or success
      }),
      catchError(err => {
        console.error('Error fetching groups:', err);
        this.error = err.message || 'An unexpected error occurred while fetching your groups.';
        // Let the template know loading is finished even on error
        return of([]); // Return an empty array on error
      }),
      finalize(() => {
        this.isLoading = false; // Ensure loading is set to false when the observable completes or errors
      }),
      takeUntil(this.destroy$) // Unsubscribe when the component is destroyed
    );
  }

  onCreateGroup(): void {
    console.log('Navigate to create group page or open modal');
    this.router.navigate(['/groups/create']); // Example navigation
  }
} 