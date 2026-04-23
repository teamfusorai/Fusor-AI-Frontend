import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ForgotPasswordComponent } from './forgot-password.component';
import { ReactiveFormsModule } from '@angular/forms';
// import { RouterTestingModule } from '@angular/router-testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from '../../core/services/auth.service';
import { SharedModule } from '../../shared/shared.module';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ForgotPasswordComponent],
      imports: [
        ReactiveFormsModule,
        // RouterTestingModule,
        HttpClientTestingModule,
        SharedModule
      ],
      providers: [AuthService]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

