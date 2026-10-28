import { Routes } from '@angular/router';

export const SEARCH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./vehicle-search/vehicle-search').then(m => m.VehicleSearch)
  },
  {
    path: ':id',
    loadComponent: () => import('./vehicle-detail/vehicle-detail').then(m => m.VehicleDetail)
  }
];

export class SearchRoutes {}