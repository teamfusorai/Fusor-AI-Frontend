import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private state: ChatbotStateService
  ) { }

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

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        // We could add a loading spinner state here
        this.state.loadBotForEdit(id).subscribe();
      }
    });

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

      const navigateNext = () => {
        this.isNextLoading = false;
        this.currentStepIndex++;
        this.router.navigate(['/workspace/create-chatbot', this.routesPath[this.currentStepIndex]]);
      };

      if (this.currentStepIndex === 2) {
        // Wait for uploads to complete before moving to the next step
        this.state.uploadPendingSources().subscribe({
          next: () => navigateNext(),
          error: () => navigateNext() // Navigate anyway even on error so user isn't stuck
        });
      } else {
        navigateNext();
      }
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

  goBack() {
    this.router.navigate(['/workspace/chatbots']);
  }

  getProgressWidth(): number {
    if (this.currentStepIndex === 0 || this.items.length <= 1) {
      return 0;
    }
    // With 5 steps, the nodes are at 10%, 30%, 50%, 70%, 90%
    // The track starts at 10%. To reach the center of node I, width must be:
    // ((I / (N-1)) * 80)
    return (this.currentStepIndex / (this.items.length - 1)) * 80;
  }

  ngOnDestroy() {
    if (this.routerSub) this.routerSub.unsubscribe();
    if (this.validSub) this.validSub.unsubscribe();
    if (this.deploySub) this.deploySub.unsubscribe();

    // Reset the chatbot state when navigating away from the create chatbot flow
    this.state.resetConfig();
  }
}