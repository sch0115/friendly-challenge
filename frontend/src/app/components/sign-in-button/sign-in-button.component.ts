import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service'; // Adjust path if needed

@Component({
  selector: 'app-sign-in-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="btn btn-primary" 
      (click)="handleGoogleSignIn()"
      [disabled]="loading"
      [class.loading]="loading"
    >
      <span *ngIf="!loading">Sign in with Google</span>
      <span *ngIf="loading">Signing in...</span>
    </button>
    <p *ngIf="error" class="text-error text-sm mt-2">{{ error }}</p>
  `,
  styles: ``
})
export class SignInButtonComponent {
  private authService = inject(AuthService);
  loading = false;
  error: string | null = null;

  async handleGoogleSignIn() {
    this.loading = true;
    this.error = null;
    try {
      await this.authService.signInWithGoogle();
      // Navigation or further actions on success will be handled by the auth state listener (Subtask 2.5)
    } catch (err: any) {
      this.error = err.message || 'Failed to sign in with Google';
      console.error('Sign-in component error:', err);
    } finally {
      this.loading = false;
    }
  }
}
