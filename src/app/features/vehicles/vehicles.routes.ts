import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const VEHICLE_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./vehicle-list/vehicle-list').then(m => m.VehicleList) },
  {
    path: 'expiring-documents',
    canActivate: [roleGuard('Admin', 'Manager', 'Staff')],
    loadComponent: () => import('./expiring-documents/expiring-documents').then(m => m.ExpiringDocuments)
  },
  {
    path: 'new',
    canActivate: [roleGuard('Admin', 'Manager')],
    loadComponent: () => import('./vehicle-form/vehicle-form').then(m => m.VehicleForm)
  },
  {
    path: ':id/edit',
    canActivate: [roleGuard('Admin', 'Manager')],
    loadComponent: () => import('./vehicle-form/vehicle-form').then(m => m.VehicleForm)
  },
  { path: ':id', loadComponent: () => import('./vehicle-details/vehicle-details').then(m => m.VehicleDetails) }
];