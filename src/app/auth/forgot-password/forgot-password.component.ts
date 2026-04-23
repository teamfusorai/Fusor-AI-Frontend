import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { AuthLoaderService } from '../../core/services/auth-loader.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  forgotForm!: FormGroup;
  successMsg = '';
  errorMsg = '';
  private authSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    public authLoader: AuthLoaderService
  ) {}

  ngOnInit(): void {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get f() { return this.forgotForm.controls; }

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.errorMsg = '';
    this.successMsg = '';

    this.authSub = this.authService.forgotPassword(this.forgotForm.value.email).subscribe({
      next: (res) => {
        this.successMsg = res.message || 'If an account exists, a reset link has been sent.';
      },
      error: (err) => {
        this.errorMsg = 'An error occurred while trying to send the reset link.';
      }
    });
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }
}

