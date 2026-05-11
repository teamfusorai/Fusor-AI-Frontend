import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem, MessageService, ConfirmationService } from 'primeng/api';
import { ChatbotService } from '../../../core/services/chatbot.service';
import { ChatbotSummary } from '../../../core/models/chatbot.model';
import { Menu } from 'primeng/menu';

@Component({
  selector: 'app-chatbots',
  templateUrl: './chatbots.component.html',
  styleUrls: ['./chatbots.component.scss'],
  providers: [MessageService, ConfirmationService] // Local provider for toasts just in case, though usually root
})
export class ChatbotsComponent implements OnInit {
  bots: ChatbotSummary[] = [];
  isLoading = true;
  menuItems: MenuItem[] = [];
  selectedBot: ChatbotSummary | null = null;
  userId: string = '';

  constructor(
    private chatbotService: ChatbotService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    this.userId = localStorage.getItem('user_id') || 'test_user_id';
    this.loadChatbots();
  }

  loadChatbots() {
    this.isLoading = true;
    this.chatbotService.getChatbots(this.userId).subscribe({
      next: (data) => {
        this.bots = data || [];
        this.isLoading = false;
      },
      error: () => {
        this.bots = [];
        this.isLoading = false;
      }
    });
  }

  toggleMenu(menu: Menu, event: Event, bot: ChatbotSummary) {
    this.selectedBot = bot;

    this.menuItems = [
      {
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: () => {
          this.router.navigate(['/workspace/create-chatbot', bot.bot_id]);
        }
      },
      {
        label: 'Analytics',
        icon: 'pi pi-chart-line',
        command: () => {
          this.router.navigate(['/workspace/analytics'], { queryParams: { bot: bot.bot_id } });
        }
      },
      {
        separator: true
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        styleClass: 'text-red-500',
        command: () => {
          this.deleteBot(bot.bot_id);
        }
      }
    ];

    menu.toggle(event);
  }

  deleteBot(botId: string) {
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
        this.chatbotService.deleteChatbot(this.userId, botId).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Chatbot deleted successfully' });
            this.loadChatbots(); // Refresh the list
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete chatbot' });
          }
        });
      }
    });
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
