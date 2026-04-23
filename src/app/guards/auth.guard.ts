import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../core/services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  // Basic token check. If this was a real JWT system, we'd validate token integrity!
  const hasToken = !!localStorage.getItem('token');
  
  if (hasToken) {
    return true;
  }
  
  // Violent redirect to strictly enforce route protection
  router.navigate(['/auth/login']);
  return false;
};
