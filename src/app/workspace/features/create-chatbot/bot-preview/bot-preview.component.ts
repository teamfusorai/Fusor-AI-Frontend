import { Component, OnInit } from '@angular/core';
import { ChatbotWizardService } from '../services/chatbot-wizard.service';
import { Observable } from 'rxjs';
import { ChatbotCreationState } from '../models/chatbot-wizard.model';

@Component({
  selector: 'app-bot-preview',
  templateUrl: './bot-preview.component.html',
  styleUrls: ['./bot-preview.component.scss']
})
export class BotPreviewComponent implements OnInit {

  wizardState$!: Observable<ChatbotCreationState>;

  constructor(private wizardService: ChatbotWizardService) { }

  ngOnInit(): void {
    this.wizardState$ = this.wizardService.state$;
  }

}
