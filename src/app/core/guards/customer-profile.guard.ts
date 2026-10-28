import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { CustomerService } from '../services/customer.service';

export class CustomerProfileGuard {
  constructor() {}
}

export const customerProfileGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.hasRole('Customer')) return true;

  return inject(CustomerService).getMyStatus().pipe(
    map(status =>
      status.hasProfile
        ? true
        : router.createUrlTree(['/customer/profile'], { queryParams: { required: 1 } })),
    // If the status check itself fails, let the page load. The API still enforces the rules.
    catchError(() => of(true))
  );
};