import { Routes } from '@angular/router';

export const PRICING_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./price-quote/price-quote').then(m => m.PriceQuote) }
];