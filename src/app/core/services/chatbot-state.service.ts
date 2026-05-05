import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, of, forkJoin, throwError } from 'rxjs';
import { catchError, mergeMap, tap, finalize, switchMap } from 'rxjs/operators';
import { ChatbotConfig } from '../models/chatbot.model';
import { KnowledgeBaseService } from './knowledge-base.service';
import { ChatbotService } from './chatbot.service';
import { DeploymentService } from './deployment.service';
import { MessageService } from 'primeng/api';

export interface DeploymentState {
  qr_code_base64: string;
  snippet: string;
  endpoint_url: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotStateService {
  private defaultConfig: ChatbotConfig = {
    chatbot_name: '',
    description: '',
    industry: '',
    color: '#000000',
    logo_preview: '',
    welcome_message: 'Hello! How can I help you today?',
    tone: 'Friendly',
    system_prompt: '',
    temperature: 0.7,
    urls: [],
    kb_doc_ids: [],
    kb_files: []
  };

  private _config = new BehaviorSubject<ChatbotConfig>(this.defaultConfig);
  public config$ = this._config.asObservable();

  private _isCurrentStepValid = new BehaviorSubject<boolean>(false);
  public isCurrentStepValid$ = this._isCurrentStepValid.asObservable();

  private _isUploading = new BehaviorSubject<boolean>(false);
  public isUploading$ = this._isUploading.asObservable();

  private _deploymentState = new BehaviorSubject<DeploymentState | null>(null);
  public deploymentState$ = this._deploymentState.asObservable();

  constructor(
    private kbService: KnowledgeBaseService,
    private chatbotService: ChatbotService,
    private deploymentService: DeploymentService,
    private messageService: MessageService
  ) {}

  setStepValidity(isValid: boolean) {
    this._isCurrentStepValid.next(isValid);
  }

  updateConfig(config: Partial<ChatbotConfig>) {
    this._config.next({ ...this._config.value, ...config });
  }

  resetConfig() {
    this._config.next(this.defaultConfig);
    this._deploymentState.next(null);
  }

  uploadPendingSources(): Observable<any> {
    const config = this._config.value;
    const pendingFiles = config.kb_files || [];
    const pendingUrls = config.urls || [];
    
    if (pendingFiles.length === 0 && pendingUrls.length === 0) {
      return of(null);
    }

    this._isUploading.next(true);

    const uploadTasks: { type: 'file' | 'url', payload: any, name: string }[] = [
      ...pendingFiles.map(f => ({ type: 'file' as const, payload: f, name: f.name })),
      ...pendingUrls.map(u => ({ type: 'url' as const, payload: u, name: u }))
    ];

    return from(uploadTasks).pipe(
      mergeMap(task => 
        this.kbService.ingest(task.type, task.payload).pipe(
          tap(response => {
            const currentIds = this._config.value.kb_doc_ids || [];
            this.updateConfig({ kb_doc_ids: [...currentIds, response.id] });
          }),
          catchError(err => {
            this.messageService.add({
              severity: 'error',
              summary: 'Upload Failed',
              detail: `Failed to upload ${task.name}`
            });
            return of(null);
          })
        ),
        3
      ),
      finalize(() => {
        this._isUploading.next(false);
      })
    );
  }

  publishChatbot(): Observable<any> {
    if (this._isUploading.value) {
      return throwError(() => new Error('Cannot publish while uploading.'));
    }

    const userId = localStorage.getItem('user_id');
    if (!userId) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'User ID not found. Please log in again.' });
      return throwError(() => new Error('User ID missing'));
    }

    const config = this._config.value;
    const formData = new FormData();
    formData.append('user_id', userId);
    
    if (config.chatbot_name) formData.append('chatbot_name', config.chatbot_name);
    if (config.description) formData.append('description', config.description);
    if (config.industry) formData.append('industry', config.industry);
    if (config.color) formData.append('color', config.color);
    if (config.welcome_message) formData.append('welcome_message', config.welcome_message);
    if (config.tone) formData.append('tone', config.tone);
    if (config.system_prompt) formData.append('system_prompt', config.system_prompt);
    if (config.temperature !== undefined) formData.append('temperature', config.temperature.toString());
    
    // Add arrays
    if (config.urls && config.urls.length) {
      formData.append('urls', JSON.stringify(config.urls));
    }
    if (config.kb_doc_ids && config.kb_doc_ids.length) {
      formData.append('kb_doc_ids', JSON.stringify(config.kb_doc_ids));
    }

    // Logo
    if (config.logo_file) {
      formData.append('logo_file', config.logo_file);
    }

    return this.chatbotService.createChatbot(formData).pipe(
      switchMap(response => {
        const botId = response.bot_id;
        
        return forkJoin({
          qr: this.deploymentService.getQrCode(userId, botId).pipe(
            catchError(err => {
              this.messageService.add({ severity: 'warn', summary: 'QR Code Failed', detail: 'Failed to generate QR code. You can retry later.' });
              return of(null);
            })
          ),
          snippet: this.deploymentService.getEmbedSnippet(userId, botId).pipe(
            catchError(err => {
              this.messageService.add({ severity: 'warn', summary: 'Snippet Failed', detail: 'Failed to generate embed snippet. You can retry later.' });
              return of(null);
            })
          )
        }).pipe(
          tap(({ qr, snippet }) => {
            this._deploymentState.next({
              qr_code_base64: qr?.qr_code_base64 || '',
              snippet: snippet?.snippet || '',
              endpoint_url: snippet?.api_base_url ? `${snippet.api_base_url}/chat/${botId}` : `https://api.fusor.ai/v1/chat/${botId}`
            });
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Chatbot published successfully!' });
          })
        );
      }),
      catchError(err => {
        this.messageService.add({ severity: 'error', summary: 'Publish Failed', detail: 'Failed to publish chatbot. Please try again.' });
        return throwError(() => err);
      })
    );
  }
}
