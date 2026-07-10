import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { Token } from '../services/token';

const API_BASE_URL = 'http://localhost:8080/api/';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const tokenService = inject(Token);
  const router = inject(Router);

  const isApiRequest = request.url.startsWith(API_BASE_URL);
  const isLoginRequest =
    request.url === 'http://localhost:8080/api/v1/auth/login';
  const isRegisterRequest =
    request.url === 'http://localhost:8080/api/v1/auth/register';

  if (!isApiRequest || isLoginRequest || isRegisterRequest) {
    return next(request);
  }

  const token = tokenService.getToken();

  const authenticatedRequest = token
    ? request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : request;

  return next(authenticatedRequest).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401
      ) {
        tokenService.removeSession();

        void router.navigate(['/login'], {
          replaceUrl: true
        });
      }

      return throwError(() => error);
    })
  );
};