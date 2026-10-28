import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // ==========================================
  // 1. LOGGED-IN APP (Protected by AuthGuard)
  // ==========================================
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout/main-layout').then(m => m.MainLayout),
    children: [
      // --- TEAM ROUTES (Anbu & Mac) ---
      {
        path: 'profile',
        loadChildren: () => import('./features/profile/profile.routes').then(m => m.PROFILE_ROUTES)
      },
      {
        path: 'customer',
        canActivate: [roleGuard('Customer')],
        loadChildren: () => import('./features/customers/customers.routes').then(m => m.CUSTOMER_ROUTES)
      },
      {
        path: 'customers',
        canActivate: [roleGuard('Admin', 'Manager', 'Staff')],
        loadChildren: () => import('./features/customers/customers.routes').then(m => m.STAFF_CUSTOMER_ROUTES)
      },
      {
        path: 'search',
        canActivate: [roleGuard('Customer')],
        loadChildren: () => import('./features/search/search.routes').then(m => m.SEARCH_ROUTES)
      },
      {
        path: 'book/:vehicleId',
        canActivate: [roleGuard('Customer')],
        loadComponent: () => import('./features/bookings/checkout/checkout').then(m => m.Checkout)
      },
      {
        path: 'bookings',
        loadChildren: () => import('./features/bookings/bookings.routes').then(m => m.BOOKING_ROUTES)
      },
      {
        path: 'payments',
        children: [
          {
            path: '',
            canActivate: [roleGuard('Customer')],
            loadComponent: () => import('./features/payments/payment-history/payment-history').then(m => m.PaymentHistory)
          },
          {
            path: 'refunds',
            canActivate: [roleGuard('Admin', 'Manager')],
            loadComponent: () => import('./features/payments/refund-form/refund-form').then(m => m.RefundForm)
          },
          {
            path: 'booking/:bookingId/pay',
            loadComponent: () => import('./features/payments/payment-pay/payment-pay').then(m => m.PaymentPay)
          },
          {
            path: 'booking/:bookingId/settlement',
            loadComponent: () => import('./features/payments/payment-settlement/payment-settlement').then(m => m.PaymentSettlement)
          },
          {
            path: 'booking/:bookingId/invoice',
            loadComponent: () => import('./features/payments/invoice-view/invoice-view').then(m => m.InvoiceView)
          }
        ]
      },
      {
        path: 'change-password',
        loadComponent: () => import('./features/auth/change-password/change-password').then(m => m.ChangePassword)
      },
      {
        path: 'vehicles',
        loadChildren: () => import('./features/vehicles/vehicles.routes').then(m => m.VEHICLE_ROUTES)
      },
      {
        path: 'branches',
        loadChildren: () => import('./features/branches/branches.routes').then(m => m.BRANCH_ROUTES)
      },
      {
        path: 'pricing',
        loadChildren: () => import('./features/pricing/pricing.routes').then(m => m.PRICING_ROUTES)
      },
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

      // --- LENIN ROUTES (Customer Experience & Business) ---
      {
        path: 'dashboard',
        canActivate: [roleGuard('Admin', 'Manager', 'Staff')],
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent)
      },
      {
        path: 'drivers',
        loadComponent: () => import('./features/driver-list/driver-list').then(m => m.DriverListComponent)
      },
      {
        path: 'drivers/new',
        loadComponent: () => import('./features/driver-form/driver-form').then(m => m.DriverFormComponent)
      },
      {
        path: 'drivers/:id/edit',
        loadComponent: () => import('./features/driver-form/driver-form').then(m => m.DriverFormComponent)
      },
      {
        path: 'services',
        loadComponent: () => import('./features/service-list/service-list').then(m => m.ServiceListComponent)
      },
      {
        path: 'coupons',
        loadComponent: () => import('./features/coupon-list/coupon-list').then(m => m.CouponListComponent)
      },
      {
        path: 'offers',
        loadComponent: () => import('./features/offer-list/offer-list').then(m => m.OfferListComponent)
      },
      {
        path: 'reviews',
        loadComponent: () => import('./features/review-list/review-list').then(m => m.ReviewListComponent)
      },
      {
        path: 'complaints',
        loadComponent: () => import('./features/complain-list/complain-list').then(m => m.ComplaintListComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/notification-list/notification-list').then(m => m.NotificationListComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/report/report').then(m => m.ReportsComponent)
      },

      // Default redirect for logged-in users
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
    ]
  },

  // ==========================================
  // 2. PUBLIC PAGES (Login / Register)
  // ==========================================
  {
    path: '',
    loadComponent: () => import('./layout/auth-layout/auth-layout/auth-layout').then(m => m.AuthLayout),
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register').then(m => m.Register)
      },
      { path: '', pathMatch: 'full', redirectTo: 'login' }
    ]
  },

  // Wildcard Fallback
  { path: '**', redirectTo: 'login' }
];
