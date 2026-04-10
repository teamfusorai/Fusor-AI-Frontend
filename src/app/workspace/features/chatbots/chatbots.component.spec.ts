import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatbotsComponent } from './chatbots.component';

describe('ChatbotsComponent', () => {
  let component: ChatbotsComponent;
  let fixture: ComponentFixture<ChatbotsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChatbotsComponent]
    });
    fixture = TestBed.createComponent(ChatbotsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
