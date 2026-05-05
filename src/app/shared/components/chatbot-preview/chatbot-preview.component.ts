import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { ChatbotConfig } from '../../../core/models/chatbot.model';

@Component({
  selector: 'app-chatbot-preview',
  templateUrl: './chatbot-preview.component.html',
  styleUrls: ['./chatbot-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatbotPreviewComponent {
  @Input() config!: Partial<ChatbotConfig>;
}
