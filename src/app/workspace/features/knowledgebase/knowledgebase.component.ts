import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { KnowledgeBaseService } from 'src/app/core/services/knowledge-base.service';
import { KnowledgeBaseItem, KnowledgeBaseStats } from 'src/app/core/models/knowledgebase.model';

@Component({
  selector: 'app-knowledgebase',
  templateUrl: './knowledgebase.component.html',
  styleUrls: ['./knowledgebase.component.scss'],
  providers: [ConfirmationService, MessageService]
})
export class KnowledgebaseComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private pollingSubscriptions = new Map<string, Subscription>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('actionMenu') actionMenu!: Menu;

  // State
  documents$ = new BehaviorSubject<KnowledgeBaseItem[]>([]);
  stats: KnowledgeBaseStats = {
    total_docs: 0,
    total_size: 0,
    processing_count: 0,
    success_rate: 0
  };

  isLoading = true;
  isUploading = false;
  isDragOver = false;
  userId = '';

  // URL input
  urlInput = '';
  urlError = '';
  isAddingUrl = false;

  // Menu
  menuItems: MenuItem[] = [];
  selectedDoc: KnowledgeBaseItem | null = null;

  // Validation
  private readonly ALLOWED_EXTENSIONS = ['pdf', 'docx', 'txt'];
  private readonly ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  constructor(
    private kbService: KnowledgeBaseService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.userId = localStorage.getItem('user_id') || 'test_user_id';
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.pollingSubscriptions.forEach(sub => sub.unsubscribe());
    this.pollingSubscriptions.clear();
  }

  loadData(): void {
    this.isLoading = true;
    this.kbService.getAllDocuments(this.userId).pipe(
      catchError(() => of({ stats: this.stats, documents: [] })),
      takeUntil(this.destroy$)
    ).subscribe(response => {
      this.isLoading = false;
      if (response.stats) {
        this.stats = response.stats;
      }
      this.documents$.next(response.documents || []);

      // Start polling for any items still processing
      (response.documents || [])
        .filter(doc => doc.status === 'Processing')
        .forEach(doc => this.startPolling(doc.id));
    });
  }

  // ─── File Upload ───

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
      input.value = ''; // Reset so same file can be selected again
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.processFile(event.dataTransfer.files[0]);
    }
  }

  private processFile(file: File): void {
    // Validate file type
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!this.ALLOWED_EXTENSIONS.includes(ext)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid File Type',
        detail: `Only PDF, DOCX, and TXT files are supported. Got: .${ext}`
      });
      return;
    }

    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      this.messageService.add({
        severity: 'error',
        summary: 'File Too Large',
        detail: `Maximum file size is 10MB. Your file is ${this.formatSize(file.size)}.`
      });
      return;
    }

    this.uploadFile(file);
  }

  private uploadFile(file: File): void {
    this.isUploading = true;

    // Optimistic UI: add to table immediately with Processing status
    const tempId = 'temp_' + Date.now();
    const tempDoc: KnowledgeBaseItem = {
      id: tempId,
      name: file.name,
      type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
      size: file.size,
      status: 'Processing',
      uploaded_at: new Date().toISOString()
    };

    const currentDocs = this.documents$.getValue();
    this.documents$.next([tempDoc, ...currentDocs]);
    this.updateLocalStats();

    this.kbService.uploadFile(this.userId, file).pipe(
      catchError(err => {
        // Remove temp item and show error
        const docs = this.documents$.getValue().filter(d => d.id !== tempId);
        this.documents$.next(docs);
        this.updateLocalStats();
        this.messageService.add({
          severity: 'error',
          summary: 'Upload Failed',
          detail: 'Could not upload the file. Please try again.'
        });
        return of(null);
      }),
      takeUntil(this.destroy$)
    ).subscribe(result => {
      this.isUploading = false;
      if (result) {
        // Replace temp doc with real one
        const docs = this.documents$.getValue().map(d =>
          d.id === tempId ? { ...result, status: result.status || 'Processing' as const } : d
        );
        this.documents$.next(docs);
        this.updateLocalStats();

        if (result.status === 'Processing') {
          this.startPolling(result.id);
        }

        this.messageService.add({
          severity: 'success',
          summary: 'Uploaded',
          detail: `${file.name} uploaded successfully.`
        });
      }
    });
  }

  // ─── URL Addition ───

  onAddUrl(): void {
    this.urlError = '';

    if (!this.urlInput.trim()) {
      this.urlError = 'Please enter a URL';
      return;
    }

    const urlPattern = /^https?:\/\/.+\..+/;
    if (!urlPattern.test(this.urlInput.trim())) {
      this.urlError = 'Please enter a valid URL (e.g., https://example.com)';
      return;
    }

    this.isAddingUrl = true;
    const url = this.urlInput.trim();

    // Optimistic UI
    const tempId = 'temp_url_' + Date.now();
    const tempDoc: KnowledgeBaseItem = {
      id: tempId,
      name: url,
      type: 'URL',
      size: 0,
      status: 'Processing',
      uploaded_at: new Date().toISOString()
    };

    const currentDocs = this.documents$.getValue();
    this.documents$.next([tempDoc, ...currentDocs]);
    this.updateLocalStats();

    this.kbService.addUrl(this.userId, url).pipe(
      catchError(() => {
        const docs = this.documents$.getValue().filter(d => d.id !== tempId);
        this.documents$.next(docs);
        this.updateLocalStats();
        this.messageService.add({
          severity: 'error',
          summary: 'Failed',
          detail: 'Could not add the URL. Please try again.'
        });
        return of(null);
      }),
      takeUntil(this.destroy$)
    ).subscribe(result => {
      this.isAddingUrl = false;
      if (result) {
        const docs = this.documents$.getValue().map(d =>
          d.id === tempId ? { ...result, status: result.status || 'Processing' as const } : d
        );
        this.documents$.next(docs);
        this.updateLocalStats();
        this.urlInput = '';

        if (result.status === 'Processing') {
          this.startPolling(result.id);
        }

        this.messageService.add({
          severity: 'success',
          summary: 'URL Added',
          detail: 'Web page is being processed.'
        });
      }
    });
  }

  // ─── Polling ───

  private startPolling(kbId: string): void {
    if (this.pollingSubscriptions.has(kbId)) return;

    const sub = this.kbService.pollDocumentStatus(kbId).pipe(
      takeUntil(this.destroy$)
    ).subscribe(result => {
      const docs = this.documents$.getValue().map(d => {
        if (d.id === kbId) {
          return { ...d, status: (result.status === 'Completed' ? 'Completed' : 'Failed') as KnowledgeBaseItem['status'] };
        }
        return d;
      });
      this.documents$.next(docs);
      this.updateLocalStats();
      this.pollingSubscriptions.delete(kbId);
    });

    this.pollingSubscriptions.set(kbId, sub);
  }

  // ─── Delete ───

  openMenu(event: Event, doc: KnowledgeBaseItem): void {
    this.selectedDoc = doc;
    this.menuItems = [
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => this.confirmDelete()
      }
    ];
    this.actionMenu.toggle(event);
  }

  private confirmDelete(): void {
    if (!this.selectedDoc) return;

    const doc = this.selectedDoc;
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${doc.name}"? This action cannot be undone.`,
      header: 'Delete Document',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.kbService.deleteDocument(doc.id).pipe(
          catchError(() => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete document.'
            });
            return of(null);
          }),
          takeUntil(this.destroy$)
        ).subscribe(result => {
          if (result !== null) {
            const docs = this.documents$.getValue().filter(d => d.id !== doc.id);
            this.documents$.next(docs);
            this.updateLocalStats();

            // Stop polling if still running
            const pollSub = this.pollingSubscriptions.get(doc.id);
            if (pollSub) {
              pollSub.unsubscribe();
              this.pollingSubscriptions.delete(doc.id);
            }

            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: `${doc.name} has been deleted.`
            });
          }
        });
      }
    });
  }

  // ─── Helpers ───

  private updateLocalStats(): void {
    const docs = this.documents$.getValue();
    this.stats = {
      total_docs: docs.length,
      total_size: docs.reduce((sum, d) => sum + (d.size || 0), 0),
      processing_count: docs.filter(d => d.status === 'Processing').length,
      success_rate: docs.length > 0
        ? Math.round((docs.filter(d => d.status === 'Completed').length / docs.length) * 100)
        : 0
    };
  }

  formatSize(bytes: number): string {
    if (!bytes || bytes === 0) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  }
}
