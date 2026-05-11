import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, of, forkJoin, throwError } from 'rxjs';
import { catchError, mergeMap, tap, finalize, switchMap, toArray } from 'rxjs/operators';
import { ChatbotConfig } from '../models/chatbot.model';
import { KnowledgeBaseService } from './knowledge-base.service';
import { ChatbotService } from './chatbot.service';
import { DeploymentService } from './deployment.service';
import { MessageService } from 'primeng/api';
import { environment } from 'src/environments/environment';

export interface DeploymentState {
  qr_code_base64: string;
  snippet: string;
  endpoint_url: string;
  api_key: string;
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
    temperature: 0.5,
    urls: [],
    kb_doc_ids: [],
    kb_files: []
  };

  private _config = new BehaviorSubject<ChatbotConfig>(this.defaultConfig);
  public config$ = this._config.asObservable();

  public currentEditId: string | null = null;

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
    this.currentEditId = null;
    this._config.next(this.defaultConfig);
    this._deploymentState.next(null);
  }

  loadBotForEdit(botId: string): Observable<any> {
    this.currentEditId = botId;
    return this.chatbotService.getChatbotById(botId).pipe(
      tap(response => {
        // Map backend response back to our frontend config
        const configToPatch: Partial<ChatbotConfig> = {
          chatbot_name: response.chatbot_name,
          description: response.description,
          industry: response.industry,
          color: response.color,
          logo_preview: response.logo_url || '',
          welcome_message: response.welcome_message,
          tone: response.tone,
          system_prompt: response.system_prompt,
          temperature: response.temperature,
          status: response.status,
          updated_at: response.updated_at,
          urls: response.urls || [],
          kb_doc_ids: response.documents ? response.documents.map((d: any) => d.id) : (response.kb_doc_ids || [])
        };
        this.updateConfig(configToPatch);
      }),
      catchError(err => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load chatbot details.' });
        return throwError(() => err);
      })
    );
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

    const userId = localStorage.getItem('user_id') || 'default_user';

    return from(uploadTasks).pipe(
      mergeMap(task => 
        this.kbService.ingest(task.type, task.payload, userId).pipe(
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
      toArray(),
      tap(responses => {
        const newIds = responses
          .filter(r => r && (r.kb_id || r.id))
          .map(r => r.kb_id || r.id);
        
        if (newIds.length > 0) {
          const currentIds = this._config.value.kb_doc_ids || [];
          this.updateConfig({ 
            kb_doc_ids: [...currentIds, ...newIds],
            kb_files: [], // Clear pending files after successful upload
            urls: []      // Clear pending URLs after successful upload
          });
        }
      }),
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
      formData.append('kb_ids', JSON.stringify(config.kb_doc_ids));
    }

    formData.append('status', 'Active');
    if (this.currentEditId) {
      formData.append('publish_deploy', 'true');
    }

    // Logo
    if (config.logo_file) {
      formData.append('logo_file', config.logo_file);
    }

    const request$ = this.currentEditId 
      ? this.chatbotService.updateChatbot(this.currentEditId, formData)
      : this.chatbotService.createChatbot(formData);

    return request$.pipe(
      switchMap(response => {
        const botId = this.currentEditId || response.bot_id;
        const apiKey = (response as { api_key?: string }).api_key ?? '';

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
              endpoint_url: snippet?.api_base_url ? `${snippet.api_base_url}/chat/${botId}` : `${environment.apiUrl}/chat/${botId}`,
              api_key: apiKey
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
