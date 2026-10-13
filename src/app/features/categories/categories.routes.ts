import { Routes } from '@angular/router';

export const CATEGORY_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./category-list/category-list').then(m => m.CategoryList) },
  {
    path: 'additional-charges',
    loadComponent: () =>
      import('./additional-charges/additional-charges').then(m => m.AdditionalCharges)
  },
  { path: 'new', loadComponent: () => import('./category-form/category-form').then(m => m.CategoryForm) },
  { path: ':id/edit', loadComponent: () => import('./category-form/category-form').then(m => m.CategoryForm) }
];