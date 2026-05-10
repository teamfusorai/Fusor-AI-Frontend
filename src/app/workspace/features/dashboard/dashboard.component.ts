import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BehaviorSubject, forkJoin, catchError, of } from 'rxjs';
import { AnalyticsService } from 'src/app/core/services/analytics.service';
import { ChatbotService } from 'src/app/core/services/chatbot.service';
import { DashboardMetrics } from 'src/app/core/models/dashboard.model';
import { ChatbotSummary } from 'src/app/core/models/chatbot.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { DeploymentService } from 'src/app/core/services/deployment.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  metrics$ = new BehaviorSubject<DashboardMetrics>({
    total_conversations: 0,
    unique_users: 0,
    total_cost: 0,
    thumbs_up_count: 0,
    thumbs_down_count: 0
  });
  chatbots$ = new BehaviorSubject<ChatbotSummary[]>([]);

  successRate: string = '0%';
  userId: string | null = null;
  loading: boolean = true;

  // Inline Deployment Expansion State
  expandedBotId: string | null = null;
  deploymentDataMap: { [botId: string]: any } = {};
  loadingDeploymentMap: { [botId: string]: boolean } = {};

  constructor(
    private analyticsService: AnalyticsService,
    private chatbotService: ChatbotService,
    private authService: AuthService,
    private deploymentService: DeploymentService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const userId = localStorage.getItem('user_id');
    this.userId = userId || 'default_user_id'; // Fallback for local testing if needed

    this.loadDashboardData();
  }

  loadDashboardData(): void {
    if (!this.userId) return;

    this.loading = true;
    forkJoin({
      metrics: this.analyticsService.getUserAnalytics(this.userId).pipe(catchError(() => of(null))),
      chatbots: this.chatbotService.getChatbots(this.userId).pipe(catchError(() => of([])))
    }).subscribe(({ metrics, chatbots }) => {
      if (metrics) {
        this.metrics$.next(metrics);
        this.calculateSuccessRate(metrics);
      }
      this.chatbots$.next(chatbots || []);
      this.loading = false;
    });
  }

  calculateSuccessRate(metrics: DashboardMetrics): void {
    const total = metrics.thumbs_up_count + metrics.thumbs_down_count;
    if (total === 0) {
      this.successRate = 'No data';
    } else {
      const rate = (metrics.thumbs_up_count / total) * 100;
      this.successRate = `${rate.toFixed(1)}%`;
    }
  }

  getMenuOptions(bot: ChatbotSummary) {
    return [
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        styleClass: 'delete-menu-item',
        command: () => this.confirmDelete(bot.bot_id)
      }
    ];
  }

  confirmDelete(botId: string): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this chatbot? This action cannot be undone.',
      header: 'Delete Chatbot',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      rejectButtonStyleClass: 'p-button-text',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      accept: () => {
        if (!this.userId) return;

        this.chatbotService.deleteChatbot(this.userId, botId).subscribe({
          next: () => {
            const currentBots = this.chatbots$.getValue() || [];
            this.chatbots$.next(currentBots.filter(bot => bot.bot_id !== botId));
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Chatbot deleted successfully.' });
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete chatbot.' });
          }
        });
      }
    });
  }

  trackByBotId(index: number, bot: ChatbotSummary): string {
    return bot.bot_id;
  }

  toggleDeployment(botId: string): void {
    if (this.expandedBotId === botId) {
      this.expandedBotId = null;
      return;
    }

    this.expandedBotId = botId;

    if (!this.deploymentDataMap[botId]) {
      this.loadingDeploymentMap[botId] = true;
      const uid = this.userId || '';

      forkJoin({
        qr: this.deploymentService.getQrCode(uid, botId).pipe(catchError(() => of(null))),
        snippet: this.deploymentService.getEmbedSnippet(uid, botId).pipe(catchError(() => of(null)))
      }).subscribe(({ qr, snippet }) => {
        this.deploymentDataMap[botId] = {
          qrCodeUrl: qr?.qr_code_base64 || '',
          embedCode: snippet?.snippet || '',
          apiUrl: snippet?.api_base_url ? `${snippet.api_base_url}/chat/${botId}` : `https://api.fusor.ai/v1/chat/${botId}`,
          apiKey: '1234567890abcdef1234567890abcdef'
        };
        this.loadingDeploymentMap[botId] = false;
      });
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    
    // If the date string doesn't have a timezone indicator (Z or +/-), 
    // append 'Z' to treat it as UTC from the server.
    let cleanDate = dateString;
    if (!dateString.includes('Z') && !dateString.includes('+') && !dateString.match(/-\d{2}:\d{2}$/)) {
      cleanDate = dateString.replace(' ', 'T') + 'Z';
    }

    const date = new Date(cleanDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffSeconds = Math.floor(diffTime / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays === 0) {
      if (diffHours === 0) {
        if (diffMinutes === 0) return 'Just now';
        return `${diffMinutes} min${diffMinutes > 1 ? 's' : ''} ago`;
      }
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}
