import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { ChatbotWizardComponent } from '../chatbot-wizard/chatbot-wizard.component';
import { ChatbotWizardService } from '../services/chatbot-wizard.service';

@Injectable({
  providedIn: 'root'
})
export class ChatbotWizardGuard implements CanDeactivate<ChatbotWizardComponent> {

  constructor(private wizardService: ChatbotWizardService) {}

  canDeactivate(component: ChatbotWizardComponent): boolean {
    const isDirty = this.wizardService.currentState.isDirty;
    if (isDirty) {
      return confirm('You have unsaved changes in your chatbot configuration. Are you sure you want to leave this page?');
    }
    return true;
  }
}
