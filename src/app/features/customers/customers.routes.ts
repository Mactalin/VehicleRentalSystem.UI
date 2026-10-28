import { Routes } from '@angular/router';

// Mounted at /customer (the logged-in customer's own pages)
export const CUSTOMER_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'profile' },
  {
    path: 'profile',
    loadComponent: () => import('./customer-profile/customer-profile/customer-profile').then(m => m.CustomerProfile)
  },
  {
    path: 'documents',
    loadComponent: () => import('./customer-documents/customer-documents').then(m => m.CustomerDocuments)
  },
  {
    path: 'history',
    loadComponent: () => import('./rental-history/rental-history').then(m => m.RentalHistory)
  }
];

// Mounted at /customers (staff, manager, admin)
export const STAFF_CUSTOMER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./customer-list/customer-list').then(m => m.CustomerList)
  },
  {
    path: ':id',
    loadComponent: () => import('./customer-review/customer-review').then(m => m.CustomerReview)
  }
];

export class CustomersRoutes {}