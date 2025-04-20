import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sign-out-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="btn btn-secondary" 
      (click)="handleSignOut()"
      [disabled]="loading"
      [class.loading]="loading"
    >
      <span *ngIf="!loading">Sign Out</span>
      <span *ngIf="loading">Signing out...</span>
    </button>
    <p *ngIf="error" class="text-error text-sm mt-2">{{ error }}</p>
  `,
  styles: ``
})
export class SignOutButtonComponent {
  private authService = inject(AuthService);
  loading = false;
  error: string | null = null;

  async handleSignOut() {
    this.loading = true;
    this.error = null;
    try {
      await this.authService.signOut();
      // Navigation or state update handled elsewhere (Subtask 2.5)
    } catch (err: any) {
      this.error = err.message || 'Failed to sign out';
      console.error('Sign-out component error:', err);
    } finally {
      this.loading = false;
    }
  }
}
