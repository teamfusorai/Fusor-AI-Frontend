import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { UserSettingsService } from 'src/app/core/services/user-settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  userId: string | null = null;
  hasOpenAiKey = false;
  loadingStatus = true;
  saving = false;
  removing = false;

  form: FormGroup;

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

    const reason = this.route.snapshot.queryParamMap.get('reason');
    if (reason === 'openai_key') {
      this.messageService.add({
        severity: 'warn',
        summary: 'OpenAI API key required',
        detail: 'Add your key below before creating a new chatbot.'
      });
      const q = { ...this.route.snapshot.queryParams };
      delete q['reason'];
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: q,
        replaceUrl: true
      });
    }

    this.refreshStatus();
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
