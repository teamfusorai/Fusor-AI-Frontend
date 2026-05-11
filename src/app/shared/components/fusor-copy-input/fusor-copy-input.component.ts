import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-fusor-copy-input',
  templateUrl: './fusor-copy-input.component.html',
  styleUrls: ['./fusor-copy-input.component.scss']
})
export class FusorCopyInputComponent implements OnChanges {
  @Input() label: string = '';
  @Input() value: string = '';
  @Input() isMasked: boolean = false;
  @Input() showRevealToggle: boolean = true;
  /** Shown in the field when value is empty (e.g. API key before publish). */
  @Input() placeholder: string = '';
  /** Short helper line under the field when value is empty. */
  @Input() emptyHint: string = '';
  /** Label for reveal when masked (e.g. "View" for API keys). */
  @Input() maskedRevealLabel: string = 'Show';
  /**
   * When true (API key only): show plaintext when a key exists; auto-reveal when the key
   * first appears or changes after publish. Does not affect "View API Documentation".
   */
  @Input() revealKeyByDefault = false;

  revealSecret = false;

  constructor(private messageService: MessageService) {}

  ngOnChanges(changes: SimpleChanges): void {
    const valueCh = changes['value'];
    const revealDefCh = changes['revealKeyByDefault'];

    if (!valueCh && !revealDefCh) {
      return;
    }

    if (!this.hasValue) {
      this.revealSecret = false;
      return;
    }

    if (this.revealKeyByDefault) {
      if (valueCh?.firstChange) {
        this.revealSecret = true;
        return;
      }
      if (valueCh) {
        const prev = valueCh.previousValue as string | undefined;
        const curr = valueCh.currentValue as string | undefined;
        const prevEmpty = !prev?.trim?.();
        const currHas = !!curr?.trim?.();
        if (prevEmpty && currHas) {
          this.revealSecret = true;
          return;
        }
        if (prev?.trim?.() && curr?.trim?.() && String(prev) !== String(curr)) {
          this.revealSecret = true;
        }
      } else if (revealDefCh?.currentValue) {
        this.revealSecret = true;
      }
      return;
    }

    if (valueCh && !valueCh.firstChange) {
      this.revealSecret = false;
    }
  }

  toggleReveal(): void {
    if (!this.hasValue) {
      return;
    }
    this.revealSecret = !this.revealSecret;
  }

  get hasValue(): boolean {
    return !!this.value?.trim();
  }

  /** Visual fill when masked + unpublished: looks like a key, same tone as placeholder copy. */
  private static readonly phantomMaskLength = 32;

  get displayInputValue(): string {
    if (this.hasValue) {
      return this.value;
    }
    if (this.isMasked) {
      return '\u2022'.repeat(FusorCopyInputComponent.phantomMaskLength);
    }
    return '';
  }

  get inputType(): string {
    if (!this.isMasked) {
      return 'text';
    }
    if (!this.hasValue) {
      return 'text';
    }
    return this.revealSecret ? 'text' : 'password';
  }

  onCopy() {
    if (!this.hasValue) {
      return;
    }
    this.messageService.add({
      severity: 'success',
      summary: 'Copied',
      detail: `${this.label || 'Value'} copied to clipboard`,
      life: 3000
    });
  }
}
