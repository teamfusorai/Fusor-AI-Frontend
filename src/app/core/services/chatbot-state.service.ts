import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ChatbotConfig } from '../models/chatbot.model';

@Injectable({
  providedIn: 'root'
})
export class ChatbotStateService {
  private defaultConfig: ChatbotConfig = {
    name: '',
    industry: '',
    tone: 'professional',
    system_prompt: ''
  };

  private _config = new BehaviorSubject<ChatbotConfig>(this.defaultConfig);
  public config$ = this._config.asObservable();

  updateConfig(config: Partial<ChatbotConfig>) {
    this._config.next({ ...this._config.value, ...config });
  }

  resetConfig() {
    this._config.next(this.defaultConfig);
  }
}
