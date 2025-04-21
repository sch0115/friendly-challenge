import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Import CommonModule for *ngIf, etc.
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';
import { UserProfile } from '../../interfaces/user-profile.interface';
import { catchError, finalize, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, DatePipe], // Add CommonModule and DatePipe
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush // Use OnPush for better performance with signals
})
export class ProfileComponent implements OnInit {
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);

  // Using signals for reactive state management
  profile = signal<UserProfile | null>(null);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.profile.set(null);

    // Check auth state using getCurrentUser()
    if (!this.authService.getCurrentUser()) {
        this.error.set('User not authenticated.');
        this.isLoading.set(false);
        // Optionally redirect to login
        // Consider using AngularFire's auth state observable for a more reactive approach
        return;
    }

    this.profileService.getProfile()
      .pipe(
        tap(profileData => {
            this.profile.set(profileData);
            this.isLoading.set(false);
        }),
        catchError(err => {
          this.error.set(err.message || 'Failed to load profile.');
          this.isLoading.set(false);
          return of(null); // Handle error gracefully
        })
      )
      .subscribe();
  }

  // Placeholder for future update logic
  // updateProfileData(data: Partial<UserProfile>): void {
  //   // ... call updateProfile service method ...
  // }
}
