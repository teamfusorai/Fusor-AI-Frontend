import { Component, OnDestroy, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { UserSettingsService } from 'src/app/core/services/user-settings.service';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
  userId: string | null = null;
  hasOpenAiKey = false;
  loadingStatus = true;
  saving = false;
  removing = false;

  /** Modal when redirected from Create chatbot without an API key */
  showOpenAiKeyRequiredDialog = false;

  form: FormGroup;

  private readonly platformId = inject(PLATFORM_ID);
  private routerEventsSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private userSettings: UserSettingsService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      openai_api_key: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.userId = localStorage.getItem('user_id');
    if (!this.userId) {
      this.loadingStatus = false;
      return;
    }

    this.consumeOpenAiKeyRedirect();

    // Lazy routes sometimes expose query params after first tick — retry once
    Promise.resolve().then(() => this.consumeOpenAiKeyRedirect());

    // Fallback: listen for NavigationEnd if URL updates slightly after init
    this.routerEventsSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.consumeOpenAiKeyRedirect());

    this.refreshStatus();
  }

  ngOnDestroy(): void {
    this.routerEventsSub?.unsubscribe();
  }

  /** Shows modal when guard sends ?reason=openai_key (and clears param from URL). */
  private consumeOpenAiKeyRedirect(): void {
    if (this.showOpenAiKeyRequiredDialog) {
      return;
    }

    let reasonHit =
      this.route.snapshot.queryParamMap.get('reason') === 'openai_key' ||
      this.router.parseUrl(this.router.url).queryParams['reason'] === 'openai_key';

    if (!reasonHit && isPlatformBrowser(this.platformId)) {
      reasonHit = new URLSearchParams(window.location.search).get('reason') === 'openai_key';
    }

    if (!reasonHit && isPlatformBrowser(this.platformId)) {
      const st = history.state as { openAiKeyGate?: boolean } | null;
      reasonHit = !!st?.openAiKeyGate;
    }

    if (!reasonHit) {
      return;
    }

    this.showOpenAiKeyRequiredDialog = true;

    // Strip query/state without full reload (avoids destroying this component)
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { reason: null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });

    if (isPlatformBrowser(this.platformId)) {
      const next = { ...(history.state || {}) } as Record<string, unknown>;
      delete next['openAiKeyGate'];
      history.replaceState(next, '');
    }
  }

  closeOpenAiKeyRequiredDialog(): void {
    this.showOpenAiKeyRequiredDialog = false;
  }

  refreshStatus(): void {
    if (!this.userId) return;
    this.loadingStatus = true;
    this.userSettings.getOpenAiKeyStatus(this.userId).subscribe({
      next: (s) => {
        this.hasOpenAiKey = !!s.has_openai_key;
        this.loadingStatus = false;
      },
      error: () => {
        /* Silent: endpoint may be missing on older APIs; treat as no key saved */
        this.hasOpenAiKey = false;
        this.loadingStatus = false;
      }
    });
  }

  saveKey(): void {
    if (!this.userId || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const key = (this.form.get('openai_api_key')?.value || '').trim();
    if (!key) return;

    this.saving = true;
    this.userSettings.saveOpenAiApiKey(this.userId, key).subscribe({
      next: () => {
        this.saving = false;
        this.form.patchValue({ openai_api_key: '' });
        this.hasOpenAiKey = true;
        this.messageService.add({
          severity: 'success',
          summary: 'Saved',
          detail: 'Your OpenAI API key has been stored securely.'
        });
      },
      error: () => {
        this.saving = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not save API key. Try again.'
        });
      }
    });
  }

  removeKey(): void {
    if (!this.userId) return;
    this.removing = true;
    this.userSettings.removeOpenAiApiKey(this.userId).subscribe({
      next: () => {
        this.removing = false;
        this.hasOpenAiKey = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Removed',
          detail: 'Your OpenAI API key was removed from this account.'
        });
      },
      error: () => {
        this.removing = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not remove API key.'
        });
      }
    });
  }
}
