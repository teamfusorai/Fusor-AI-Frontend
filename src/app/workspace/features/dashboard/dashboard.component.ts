import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BehaviorSubject, forkJoin, catchError, of } from 'rxjs';
import { AnalyticsService } from 'src/app/core/services/analytics.service';
import { ChatbotService } from 'src/app/core/services/chatbot.service';
import { DashboardMetrics } from 'src/app/core/models/dashboard.model';
import { ChatbotSummary } from 'src/app/core/models/chatbot.model';
import { AuthService } from 'src/app/core/services/auth.service';

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

  constructor(
    private analyticsService: AnalyticsService,
    private chatbotService: ChatbotService,
    private authService: AuthService,
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
}
