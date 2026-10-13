import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Logged-in app (first, so '/' goes through authGuard)
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout/main-layout').then(m => m.MainLayout),
    children: [
      { path: 'profile', loadChildren: () => import('./features/profile/profile.routes').then(m => m.PROFILE_ROUTES) },
      {
        path: 'change-password',
        loadComponent: () =>
          import('./features/auth/change-password/change-password').then(m => m.ChangePassword)
      },
      { path: 'vehicles', loadChildren: () => import('./features/vehicles/vehicles.routes').then(m => m.VEHICLE_ROUTES) },
      { path: 'branches', loadChildren: () => import('./features/branches/branches.routes').then(m => m.BRANCH_ROUTES) },
      { path: 'pricing', loadChildren: () => import('./features/pricing/pricing.routes').then(m => m.PRICING_ROUTES) },
      {
        path: 'categories',
        canActivate: [roleGuard('Admin', 'Manager')],
        loadChildren: () => import('./features/categories/categories.routes').then(m => m.CATEGORY_ROUTES)
      },
      {
        path: 'maintenance',
        canActivate: [roleGuard('Admin', 'Manager', 'Staff')],
        loadChildren: () => import('./features/maintenance/maintenance.routes').then(m => m.MAINTENANCE_ROUTES)
      },
      {
        path: 'users',
        canActivate: [roleGuard('Admin', 'Manager')],
        loadChildren: () => import('./features/users/users.routes').then(m => m.USER_ROUTES)
      },
      { path: '', pathMatch: 'full', redirectTo: 'vehicles' }
    ]
  },

  // Public pages
  {
    path: '',
    loadComponent: () => import('./layout/auth-layout/auth-layout/auth-layout').then(m => m.AuthLayout),
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/login/login').then(m => m.Login) },
      { path: 'register', loadComponent: () => import('./features/auth/register/register').then(m => m.Register) }
    ]
  },

  { path: '**', redirectTo: '' }
];