import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuthResponse {
  message: string;
  user_id: string;
  name?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Using direct URL as we removed environment import to fix lint error
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) { }

  login(payload: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload);
  }

  signup(payload: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, payload);
  }

  // MOCKED for now as API isn't ready
  forgotPassword(email: string): Observable<any> {
    console.log('[MOCK] Forgot Password triggered for:', email);
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ message: 'Reset link sent successfully (Mocked)' });
        observer.complete();
      }, 1000);
    });
  }
}
