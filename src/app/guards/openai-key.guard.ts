import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { UserSettingsService } from '../core/services/user-settings.service';

/**
 * Blocks the **new** chatbot wizard (`/workspace/create-chatbot/...` without bot id).
 * Edit flow uses `/workspace/create-chatbot/:botId/...` — different route, no guard.
 */
export const openAiKeyGuard: CanActivateFn = () => {
  const router = inject(Router);
  const settings = inject(UserSettingsService);
  const userId = localStorage.getItem('user_id');
  if (!userId) {
    router.navigate(['/auth/login']);
    return false;
  }

  return settings.getOpenAiKeyStatus(userId).pipe(
    map((s) => {
      if (s.has_openai_key) {
        return true;
      }
      router.navigate(['/workspace/settings'], {
        queryParams: { reason: 'openai_key' },
        state: { openAiKeyGate: true }
      });
      return false;
    }),
    catchError(() => {
      router.navigate(['/workspace/settings'], {
        queryParams: { reason: 'openai_key' },
        state: { openAiKeyGate: true }
      });
      return of(false);
    })
  );
};
