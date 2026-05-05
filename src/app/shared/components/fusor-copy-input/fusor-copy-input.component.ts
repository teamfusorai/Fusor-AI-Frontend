import { Component, Input } from '@angular/core';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-fusor-copy-input',
  templateUrl: './fusor-copy-input.component.html',
  styleUrls: ['./fusor-copy-input.component.scss']
})
export class FusorCopyInputComponent {
  @Input() label: string = '';
  @Input() value: string = '';
  @Input() isMasked: boolean = false;

  constructor(private messageService: MessageService) {}

  onCopy() {
    this.messageService.add({
      severity: 'success',
      summary: 'Copied',
      detail: `${this.label || 'Value'} copied to clipboard`,
      life: 3000
    });
  }
}
