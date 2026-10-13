import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const BRANCH_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./branch-list/branch-list').then(m => m.BranchList) },
  {
    path: 'new',
    canActivate: [roleGuard('Admin', 'Manager')],
    loadComponent: () => import('./branch-form/branch-form').then(m => m.BranchForm)
  },
  {
    path: ':id/edit',
    canActivate: [roleGuard('Admin', 'Manager')],
    loadComponent: () => import('./branch-form/branch-form').then(m => m.BranchForm)
  }
];