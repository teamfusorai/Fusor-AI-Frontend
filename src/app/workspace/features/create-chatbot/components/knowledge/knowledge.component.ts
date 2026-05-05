import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
// import { ChatbotStateService } from '../../..../core/services/chatbot-state.service';
// import { KnowledgeSourceItem } from '../../../../core/models/chatbot.model';
import { ChatbotStateService } from 'src/app/core/services/chatbot-state.service';
import { KnowledgeSourceItem } from 'src/app/core/models/chatbot.model';
@Component({
  selector: 'app-knowledge',
  templateUrl: './knowledge.component.html',
  styleUrls: ['./knowledge.component.scss']
})
export class KnowledgeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // State from ChatbotConfig
  public files: File[] = [];
  public urls: string[] = [];

  // Unified sources for UI
  public unifiedSources: KnowledgeSourceItem[] = [];

  // Active box state
  public activeBox: 'file' | 'url' | null = null;

  // Form control for inline URL
  public urlControl = new FormControl('', [
    Validators.pattern(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/)
  ]);

  // Validation constants
  private readonly MAX_FILES = 5;
  private readonly MAX_TOTAL_SIZE_MB = 50;
  private readonly ALLOWED_EXTS = ['.txt', '.pdf', '.docx', '.doc'];

  constructor(
    private state: ChatbotStateService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    // Sync state
    this.state.config$.pipe(takeUntil(this.destroy$)).subscribe(config => {
      this.files = config.kb_files || [];
      this.urls = config.urls || [];
      this.updateUnifiedSources();

      // Require at least one document or URL to proceed
      this.state.setStepValidity(this.unifiedSources.length > 0);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateUnifiedSources(): void {
    this.unifiedSources = [
      ...this.files.map(f => ({ type: 'file' as const, name: f.name, file: f })),
      ...this.urls.map(u => ({ type: 'url' as const, name: u, url: u }))
    ];
  }

  setActiveBox(box: 'file' | 'url', fileInput?: HTMLInputElement): void {
    this.activeBox = box;
    if (box === 'file' && fileInput) {
      fileInput.click();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const newFiles = Array.from(input.files);

    // Check max files
    if (this.files.length + newFiles.length > this.MAX_FILES) {
      this.showError(`You can only upload a maximum of ${this.MAX_FILES} files.`);
      return;
    }

    // Check extensions and aggregate size
    let validFiles: File[] = [];
    let totalSize = this.files.reduce((sum, f) => sum + f.size, 0);

    for (const file of newFiles) {
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!this.ALLOWED_EXTS.includes(ext)) {
        this.showError(`Invalid file type: ${file.name}. Allowed: ${this.ALLOWED_EXTS.join(', ')}`);
        continue;
      }

      if (totalSize + file.size > this.MAX_TOTAL_SIZE_MB * 1024 * 1024) {
        this.showError(`Adding ${file.name} exceeds the ${this.MAX_TOTAL_SIZE_MB}MB total size limit.`);
        continue;
      }

      validFiles.push(file);
      totalSize += file.size;
    }

    if (validFiles.length) {
      const updatedFiles = [...this.files, ...validFiles];
      this.state.updateConfig({ kb_files: updatedFiles });
    }

    // Reset input
    input.value = '';
  }

  addUrl(): void {
    if (this.urlControl.invalid) {
      this.showError('Please enter a valid URL.');
      return;
    }

    const url = this.urlControl.value?.trim();
    if (!url) return;

    if (this.urls.includes(url)) {
      this.showError('This URL has already been added.');
      return;
    }

    const updatedUrls = [...this.urls, url];
    this.state.updateConfig({ urls: updatedUrls });
    this.urlControl.reset();
  }

  removeSource(index: number): void {
    const item = this.unifiedSources[index];
    if (item.type === 'file') {
      const updatedFiles = this.files.filter(f => f !== item.file);
      this.state.updateConfig({ kb_files: updatedFiles });
    } else {
      const updatedUrls = this.urls.filter(u => u !== item.url);
      this.state.updateConfig({ urls: updatedUrls });
    }
  }

  private showError(detail: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Validation Error',
      detail
    });
  }
}
