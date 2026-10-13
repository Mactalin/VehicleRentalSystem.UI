import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // Token expired or invalid (but not a failed login attempt)
      if (err.status === 401 && !req.url.includes('/auth/login')) auth.logout();

      // Backend sends ProblemDetails { title, detail } for service errors,
      // and ValidationProblemDetails { errors: { Field: [..] } } for DTO validation
      let message = err.error?.detail ?? err.error?.title ?? 'Something went wrong.';
      if (err.error?.errors) message = Object.values<string[]>(err.error.errors).flat().join(' ');
      if (err.status === 0) message = 'Cannot reach the server.';
      if (err.status === 403) message = 'You do not have permission to do that.';

      return throwError(() => new Error(message));
    })
  );
};