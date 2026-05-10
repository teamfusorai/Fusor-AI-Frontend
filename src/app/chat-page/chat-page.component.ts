import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-chat-page',
  template: `
    <div class="chat-page-container">
      <iframe 
        *ngIf="safeUrl"
        [src]="safeUrl" 
        frameborder="0" 
        allow="microphone; camera; clipboard-write"
        allowfullscreen>
      </iframe>
    </div>
  `,
  styles: [`
    .chat-page-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100vh; /* Fallback */
      height: 100dvh; /* Dynamic viewport height for mobile */
      overflow: hidden;
      background: #fff;
      z-index: 9999;
    }
    iframe {
      display: block;
      width: 100%;
      height: 100%;
      border: none;
    }
  `]
})
export class ChatPageComponent implements OnInit {
  safeUrl: SafeResourceUrl | null = null;

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const botId = this.route.snapshot.paramMap.get('id');
    if (botId) {
      const url = `https://api.fusorai.com/chat/${botId}`;
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
  }
}
