import { Routes } from '@angular/router';

export const MAINTENANCE_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./maintenance-list/maintenance-list').then(m => m.MaintenanceList) },
  { path: 'new', loadComponent: () => import('./maintenance-form/maintenance-form').then(m => m.MaintenanceForm) },
  { path: ':id/edit', loadComponent: () => import('./maintenance-form/maintenance-form').then(m => m.MaintenanceForm) },
  { path: ':id', loadComponent: () => import('./maintenance-details/maintenance-details').then(m => m.MaintenanceDetails) }
];