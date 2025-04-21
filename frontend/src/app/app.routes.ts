import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard'; // Adjust path if guard location is different

export const routes: Routes = [
    // Example: Redirect root to a dashboard or home page (if exists)
    // { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    // { path: 'dashboard', 
    //   loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    //   canActivate: [authGuard]
    // },
    {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [authGuard] // Protect the profile route
    },
    // Add other routes here (e.g., login page)
    // { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },

    // Fallback route (optional)
    // { path: '**', redirectTo: '' } 
];
