import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // Adjust path as needed

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex justify-center items-center min-h-screen">
      <div class="card w-96 bg-base-100 shadow-xl">
        <div class="card-body items-center text-center">
          <h2 class="card-title">Login</h2>
          <p>Please sign in to continue</p>
          <div class="card-actions justify-end mt-4">
            <button class="btn btn-primary" (click)="loginWithGoogle()">
              Sign in with Google
            </button>
          </div>
          <div *ngIf="errorMessage" class="text-error mt-2">
            {{ errorMessage }}
          </div>
        </div>
      </div>
    </div>
  `,
  // No separate styles needed for now
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  errorMessage: string | null = null;

  async loginWithGoogle(): Promise<void> {
    this.errorMessage = null; // Clear previous errors
    try {
      await this.authService.signInWithGoogle();
      // Successful sign-in is handled by the auth state observable
      // redirecting to dashboard usually happens via guard or app component logic
      console.log('Login component: Sign-in successful, auth state should trigger redirect.');
      this.router.navigate(['/dashboard']); // Or let the auth guard handle redirection
    } catch (error) {
      console.error('Login component: Google Sign-in error', error);
      this.errorMessage = 'Failed to sign in with Google. Please try again.';
      // Handle specific errors if needed (e.g., popup closed)
      if (error instanceof Error) {
          this.errorMessage = error.message;
      } else {
           this.errorMessage = 'An unknown error occurred during sign-in.';
      }
    }
  }
} 