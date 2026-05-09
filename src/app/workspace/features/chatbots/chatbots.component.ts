import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { ChatbotService } from '../../../core/services/chatbot.service';
import { ChatbotSummary } from '../../../core/models/chatbot.model';
import { Menu } from 'primeng/menu';

@Component({
  selector: 'app-chatbots',
  templateUrl: './chatbots.component.html',
  styleUrls: ['./chatbots.component.scss'],
  providers: [MessageService] // Local provider for toasts just in case, though usually root
})
export class ChatbotsComponent implements OnInit {
  bots: ChatbotSummary[] = [];
  isLoading = true;
  menuItems: MenuItem[] = [];
  selectedBot: ChatbotSummary | null = null;
  userId: string = '';

  tabs = [
    { label: 'All', active: true },
    { label: 'Active', active: false },
    { label: 'Inactive', active: false },
    { label: 'Draft', active: false }
  ];

  constructor(
    private chatbotService: ChatbotService,
    private router: Router,
    private messageService: MessageService
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
    if (confirm('Are you sure you want to delete this chatbot?')) {
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
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) return 'Just now';
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}
