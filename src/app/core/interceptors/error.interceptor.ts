import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private router: Router) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          this.authService.logout();
          this.router.navigate(['/auth/login']);
        }

        let standardError = { error: { code: 'UNKNOWN_ERROR', message: 'An unknown error occurred' } };

        if (error.error instanceof ErrorEvent) {
          standardError.error.message = error.error.message;
        } else {
          standardError.error.code = error.status.toString();
          standardError.error.message = error.error?.message || error.message;
        }

        return throwError(() => standardError);
      })
    );
  }
}
