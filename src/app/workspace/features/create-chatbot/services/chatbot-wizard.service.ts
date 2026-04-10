import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
// import { ChatbotCreationState, ChatbotBasicInfo, ChatbotCustomization } from '../models/chatbot-wizard.model';
import { ChatbotCreationState, ChatbotBasicInfo, ChatbotCustomization } from '../models/chatbot-wizard.model';

const STORAGE_KEY = 'fusor_chatbot_wizard_state';

const defaultState: ChatbotCreationState = {
  basicInfo: { name: '', industry: '' },
  customization: {
    primaryColor: '#000000',
    logoUrl: null,
    welcomeMessage: 'Hello! How can I help you today?'
  },
  isDirty: false
};

@Injectable({
  providedIn: 'root'
})
export class ChatbotWizardService {
  private stateSource = new BehaviorSubject<ChatbotCreationState>(this.getInitialState());
  public state$ = this.stateSource.asObservable();

  private isCurrentStepValidSource = new BehaviorSubject<boolean>(false);
  public isCurrentStepValid$ = this.isCurrentStepValidSource.asObservable();

  constructor() { }

  private getInitialState(): ChatbotCreationState {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse wizard state from session storage', e);
      }
    }
    return defaultState;
  }

  public get currentState(): ChatbotCreationState {
    return this.stateSource.getValue();
  }

  updateBasicInfo(info: Partial<ChatbotBasicInfo>) {
    this.updateState({
      basicInfo: { ...this.currentState.basicInfo, ...info }
    });
  }

  updateCustomization(cust: Partial<ChatbotCustomization>) {
    this.updateState({
      customization: { ...this.currentState.customization, ...cust }
    });
  }

  private updateState(partialState: Partial<ChatbotCreationState>) {
    const newState = {
      ...this.currentState,
      ...partialState,
      isDirty: true
    };

    this.stateSource.next(newState);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  }

  setCurrentStepValidity(isValid: boolean) {
    this.isCurrentStepValidSource.next(isValid);
  }

  clearState() {
    this.stateSource.next(defaultState);
    sessionStorage.removeItem(STORAGE_KEY);
    this.isCurrentStepValidSource.next(false);
  }
}
