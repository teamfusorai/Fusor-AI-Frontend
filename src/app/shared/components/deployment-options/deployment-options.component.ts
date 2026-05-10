import { Component, Input } from '@angular/core';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-fusor-deployment-options',
  templateUrl: './deployment-options.component.html',
  styleUrls: ['./deployment-options.component.scss']
})
export class DeploymentOptionsComponent {
  @Input() mode: 'builder' | 'dashboard' = 'builder';
  @Input() data: { qrCodeUrl: string, embedCode: string, apiUrl: string, apiKey: string } | null = null;
  @Input() isLoading: boolean = false;

  constructor(private messageService: MessageService) { }

  copyToClipboard(text: string): void {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      this.messageService.add({ severity: 'success', summary: 'Copied', detail: 'Copied to clipboard' });
    }).catch(() => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to copy to clipboard' });
    });
  }
}
