import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RoleName } from '../models/enums';
import { AuthService } from '../services/auth.service';

export const roleGuard = (...roles: RoleName[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  if (auth.hasRole(...roles)) return true;

  const destination = auth.role() === 'Customer' ? '/search' : '/';
  return inject(Router).createUrlTree([destination]);
};