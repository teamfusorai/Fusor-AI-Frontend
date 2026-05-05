import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { ChatbotStateService } from 'src/app/core/services/chatbot-state.service';
interface ToneCard {
  title: string;
  description: string;
}

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Tone Options
  public toneCards: ToneCard[] = [
    { title: 'Friendly', description: 'Casual and approachable' },
    { title: 'Formal', description: 'Professional and polite' },
    { title: 'Technical', description: 'Precise and detailed' },
    { title: 'Neutral', description: 'Balanced approach' }
  ];

  // Active State
  public activeTone: string = 'Friendly';

  // Form Controls
  public temperatureControl = new FormControl<number>(0.7);
  public systemPromptControl = new FormControl<string>('');

  constructor(private state: ChatbotStateService) { }

  ngOnInit(): void {
    // 1. Sync from global state
    this.state.config$.pipe(takeUntil(this.destroy$)).subscribe(config => {
      this.activeTone = config.tone || 'Friendly';

      // Update form controls without emitting back to avoid loops if value hasn't actually changed
      if (this.temperatureControl.value !== config.temperature) {
        this.temperatureControl.setValue(config.temperature, { emitEvent: false });
      }
      if (this.systemPromptControl.value !== config.system_prompt) {
        this.systemPromptControl.setValue(config.system_prompt || '', { emitEvent: false });
      }

      // Step 4 is always technically valid
      this.state.setStepValidity(true);
    });

    // 2. Sync to global state
    this.temperatureControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(val => {
        if (val !== null) {
          this.state.updateConfig({ temperature: val });
        }
      });

    this.systemPromptControl.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300) // Debounce typing for textarea
      )
      .subscribe(val => {
        this.state.updateConfig({ system_prompt: val || '' });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectTone(tone: string): void {
    this.activeTone = tone;
    this.state.updateConfig({ tone: tone });
  }
}
