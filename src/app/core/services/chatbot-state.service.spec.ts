import { TestBed } from '@angular/core/testing';
import { ChatbotStateService } from './chatbot-state.service';

describe('ChatbotStateService', () => {
  let service: ChatbotStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatbotStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
