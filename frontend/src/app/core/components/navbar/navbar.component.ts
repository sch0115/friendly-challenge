import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../../services/auth.service'; // Corrected path

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  // No specific SCSS needed, relying on daisyUI/Tailwind
})
export class NavbarComponent {
  private authService = inject(AuthService);

  isLoggedIn$: Observable<boolean>;
  // You might want user info as well, e.g., user$: Observable<User | null>;

  constructor() {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    // this.user$ = this.authService.user$; // If you have user info observable
  }

  logout(): void {
    this.authService.signOut();
    // Optionally navigate to login page or home page after logout
  }
}
