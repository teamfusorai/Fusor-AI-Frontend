import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MessageService } from 'primeng/api';

export type DeploySegment = 'qr' | 'embed' | 'api';

@Component({
  selector: 'app-fusor-deployment-options',
  templateUrl: './deployment-options.component.html',
  styleUrls: ['./deployment-options.component.scss']
})
export class DeploymentOptionsComponent implements OnChanges {
  @Input() mode: 'builder' | 'dashboard' = 'builder';
  @Input() data: { qrCodeUrl: string; embedCode: string; apiUrl: string; apiKey: string } | null = null;
  @Input() isLoading: boolean = false;

  apiDocVisible = false;

  /** Dashboard popup: one method at a time (segmented control). */
  deploySegment: DeploySegment = 'qr';
  readonly deploySegmentOptions: { label: string; value: DeploySegment }[] = [
    { label: 'QR code', value: 'qr' },
    { label: 'Embed', value: 'embed' },
    { label: 'API', value: 'api' }
  ];

  constructor(private messageService: MessageService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.mode !== 'dashboard') {
      return;
    }
    if (
      changes['isLoading']?.previousValue === true &&
      changes['isLoading']?.currentValue === false
    ) {
      this.deploySegment = 'qr';
    }
  }

  get docEndpoint(): string {
    const u = this.data?.apiUrl?.trim();
    return u || 'https://YOUR_API_BASE/chat/YOUR_BOT_ID';
  }

  get docApiKeyPlaceholder(): string {
    const k = this.data?.apiKey?.trim();
    return k || 'YOUR_API_KEY';
  }

  get jsonBodyExample(): string {
    return `{
  "query": "What are your opening hours?",
  "user_id": "your_stable_user_or_tenant_id",
  "top_k": 3,
  "visitor_id": "optional-anonymous-end-user-id"
}`;
  }

  get curlExample(): string {
    const ep = this.docEndpoint;
    const key = this.docApiKeyPlaceholder;
    return `curl -X POST "${ep}" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${key}" \\
  -d '{"query":"Hello","user_id":"my-app-user","top_k":3}'`;
  }

  openApiDocumentation(): void {
    this.apiDocVisible = true;
  }

  copyToClipboard(text: string): void {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      this.messageService.add({ severity: 'success', summary: 'Copied', detail: 'Copied to clipboard' });
    }).catch(() => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to copy to clipboard' });
    });
  }
}
