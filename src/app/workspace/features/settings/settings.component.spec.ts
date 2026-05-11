import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';

import { SettingsComponent } from './settings.component';
import { UserSettingsService } from 'src/app/core/services/user-settings.service';
import { SharedModule } from 'src/app/shared/shared.module';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SettingsComponent],
      imports: [HttpClientTestingModule, ReactiveFormsModule, RouterTestingModule, SharedModule],
      providers: [
        MessageService,
        {
          provide: UserSettingsService,
          useValue: {
            getOpenAiKeyStatus: () => of({ has_openai_key: false }),
            saveOpenAiApiKey: () => of({ message: 'ok', has_openai_key: true }),
            removeOpenAiApiKey: () => of({ message: 'ok', has_openai_key: false })
          }
        }
      ]
    });
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
