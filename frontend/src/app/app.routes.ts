import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard'; // Adjust path if guard location is different
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { GroupDetailComponent } from './pages/group-detail/group-detail.component';
import { CreateGroupComponent } from './pages/create-group/create-group.component';

export const routes: Routes = [
    // Example: Redirect root to a dashboard or home page (if exists)
    // { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [authGuard] // Protect the profile route
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [authGuard]
    },
    {
        path: 'groups/create',
        component: CreateGroupComponent,
        canActivate: [authGuard]
    },
    {
        path: 'groups/:id',
        component: GroupDetailComponent,
        canActivate: [authGuard]
    },
    // Default route redirects to dashboard if logged in, otherwise login
    {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
    },
    // Wildcard route for 404
    // { path: '**', component: PageNotFoundComponent }, // Optional: Add a 404 component
];
