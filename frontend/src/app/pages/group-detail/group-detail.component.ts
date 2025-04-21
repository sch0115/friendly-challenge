import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, Subject, switchMap, catchError, of, takeUntil, finalize } from 'rxjs';
import { Group } from '../../core/models/group.model';
import { GroupsService } from '../../core/services/groups.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-group-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './group-detail.component.html',
  // No specific SCSS needed, relying on daisyUI/Tailwind
})
export class GroupDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private groupsService = inject(GroupsService);
  private destroy$ = new Subject<void>();

  group$: Observable<Group | null> = of(null);
  isLoading: boolean = true;
  error: string | null = null;

  ngOnInit(): void {
    this.group$ = this.route.paramMap.pipe(
      takeUntil(this.destroy$),
      switchMap(params => {
        const groupId = params.get('id');
        if (!groupId) {
          this.error = 'Group ID not found in route.';
          this.isLoading = false;
          return of(null); // Return null if no ID
        }
        this.isLoading = true;
        this.error = null;
        // We need a getGroupById method in GroupsService
        return this.groupsService.getGroupById(groupId).pipe(
          catchError(err => {
            console.error('Error fetching group details:', err);
            this.error = err.message || 'Could not load group details.';
            return of(null); // Return null on error
          }),
          finalize(() => {
            this.isLoading = false; // Stop loading indicator
          })
        );
      })
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goBack(): void {
    // Example: Navigate back to the dashboard or previous page
    this.router.navigate(['/dashboard']);
  }
} 