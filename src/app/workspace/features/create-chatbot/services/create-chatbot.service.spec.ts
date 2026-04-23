import { TestBed } from '@angular/core/testing';

import { CreateChatbotService } from './create-chatbot.service';

describe('CreateChatbotService', () => {
  let service: CreateChatbotService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreateChatbotService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
