import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MenuItem } from 'primeng/api';
import { ChatbotStateService } from '../../../core/services/chatbot-state.service';

@Component({
  selector: 'app-create-chatbot',
  templateUrl: './create-chatbot.component.html',
  styleUrls: ['./create-chatbot.component.scss']
})
export class CreateChatbotComponent implements OnInit, OnDestroy {
  items: MenuItem[] = [];
  currentStepIndex: number = 0;
  isNextValid: boolean = false;
  isPublished: boolean = false;
  isUploading$!: Observable<boolean>;

  private routerSub!: Subscription;
  private validSub!: Subscription;
  private deploySub!: Subscription;

  private routesPath = [
    'basic-info',
    'customization',
    'knowledge',
    'configuration',
    'publish'
  ];

  constructor(private router: Router, private state: ChatbotStateService) { }

  ngOnInit() {
    this.items = [
      { label: 'Basic Info', title: 'Name & description' },
      { label: 'Customization', title: 'Appearance & branding' },
      { label: 'Knowledge', title: 'Data & sources' },
      { label: 'Configuration', title: 'Model & prompts' },
      { label: 'Publish', title: 'Review details' }
    ];

    this.isUploading$ = this.state.isUploading$;

    // Sync state immediately on load
    const activeRoute = this.router.url.split('/').pop() || '';
    const index = this.routesPath.indexOf(activeRoute);
    if (index !== -1) {
      this.currentStepIndex = index;
    }

    this.validSub = this.state.isCurrentStepValid$.subscribe((valid: boolean) => {
      this.isNextValid = valid;
    });

    this.deploySub = this.state.deploymentState$.subscribe(state => {
      if (state) {
        this.isPublished = true;
      }
    });

    this.routerSub = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const activeRoute = event.urlAfterRedirects.split('/').pop() || '';
      const index = this.routesPath.indexOf(activeRoute);
      if (index !== -1) {
        this.currentStepIndex = index;
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    });
  }

  isNextLoading: boolean = false;

  goToNextStep() {
    if (this.currentStepIndex === 4) {
      if (this.isPublished) {
        this.router.navigate(['/workspace/dashboard']);
        return;
      }

      this.isNextLoading = true;
      this.state.publishChatbot().subscribe({
        next: () => {
          this.isNextLoading = false;
        },
        error: () => {
          this.isNextLoading = false;
        }
      });
      return;
    }

    if ((this.currentStepIndex === 2 || this.currentStepIndex === 3) && this.isNextValid) {
      this.isNextLoading = true;
      if (this.currentStepIndex === 2) {
        this.state.uploadPendingSources().subscribe();
      }
      
      setTimeout(() => {
        this.isNextLoading = false;
        this.currentStepIndex++;
        this.router.navigate(['/workspace/create-chatbot', this.routesPath[this.currentStepIndex]]);
      }, 2500);
      return;
    }

    if (this.currentStepIndex < this.routesPath.length - 1 && this.isNextValid) {
      this.currentStepIndex++;
      this.router.navigate(['/workspace/create-chatbot', this.routesPath[this.currentStepIndex]]);
    }
  }

  goToPreviousStep() {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.router.navigate(['/workspace/create-chatbot', this.routesPath[this.currentStepIndex]]);
    }
  }
  
  getProgressWidth(): number {
    if (this.currentStepIndex === 0) {
      return 0;
    }
    // Custom percentages for each step
    const widths = [0, 20, 42, 62, 100]; // Step 1 to Step 5
    return widths[this.currentStepIndex];
  }
  
  ngOnDestroy() {
    if (this.routerSub) this.routerSub.unsubscribe();
    if (this.validSub) this.validSub.unsubscribe();
    if (this.deploySub) this.deploySub.unsubscribe();
  }
}