import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  constructor(private router: Router) {}

  navigateToLogin(): void {
    this.router.navigate(['/auth']);
  }

  navigateToSignup(): void {
    this.router.navigate(['/auth/signup']);
  }

  handleGetStarted(): void {
    const isLoggedIn = !!localStorage.getItem('user_id');
    if (isLoggedIn) {
      this.router.navigate(['/workspace/dashboard']);
    } else {
      this.router.navigate(['/auth/signup']);
    }
  }

  handleCreateChatbot(): void {
    const isLoggedIn = !!localStorage.getItem('user_id');
    if (isLoggedIn) {
      this.router.navigate(['/workspace/create-chatbot']);
    } else {
      this.router.navigate(['/auth/signup']);
    }
  }

  // Placeholder for demo functionality
  viewDemo(): void {
    console.log('View Demo Clicked');
  }
}
