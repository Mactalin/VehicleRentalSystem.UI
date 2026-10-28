import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';
import { AuthService } from '../../core/services/auth.service';

const STAFF = roleGuard('Admin', 'Manager', 'Staff');

export const BOOKING_ROUTES: Routes = [
  {
    // Customers see their bookings in Rental history. Staff see the booking list.
    path: '',
    pathMatch: 'full',
    redirectTo: () => (inject(AuthService).hasRole('Customer') ? '/customer/history' : '/bookings/manage')
  },
  {
    path: 'manage',
    canActivate: [STAFF],
    loadComponent: () => import('./booking-list/booking-list').then(m => m.BookingList)
  },
  {
    path: ':id',
    loadComponent: () => import('./booking-details/booking-details').then(m => m.BookingDetails)
  },
  {
    path: ':id/modify',
    loadComponent: () => import('./booking-modify/booking-modify').then(m => m.BookingModify)
  },
  {
    path: ':id/pickup',
    canActivate: [STAFF],
    loadComponent: () => import('./booking-pickup/booking-pickup').then(m => m.BookingPickup)
  },
  {
    path: ':id/return',
    canActivate: [STAFF],
    loadComponent: () => import('./booking-return/booking-return').then(m => m.BookingReturn)
  }
];

export class BookingsRoutes {}
