import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ChatbotWizardService } from '../services/chatbot-wizard.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chatbot-wizard',
  templateUrl: './chatbot-wizard.component.html',
  styleUrls: ['./chatbot-wizard.component.scss']
})
export class ChatbotWizardComponent implements OnInit {
  steps: MenuItem[] = [];
  activeIndex: number = 0;

  constructor(
    public wizardService: ChatbotWizardService,
    private router: Router
  ) {}

  ngOnInit() {
    this.steps = [
      { label: 'Basic Info', routerLink: 'basic-info' },
      { label: 'Customization', routerLink: 'customization' },
      { label: 'Knowledge', routerLink: 'knowledge' },
      { label: 'Configuration', routerLink: 'configuration' },
      { label: 'Publish', routerLink: 'publish' }
    ];
  }

  next() {
    this.activeIndex++;
    this.router.navigate([this.getRoutePath(this.activeIndex)]);
  }

  prev() {
    this.activeIndex--;
    this.router.navigate([this.getRoutePath(this.activeIndex)]);
  }

  private getRoutePath(index: number): string {
    return 'workspace/create-chatbot/' + this.steps[index].routerLink;
  }
}
