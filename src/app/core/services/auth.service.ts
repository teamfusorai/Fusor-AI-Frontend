import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthResponse, LoginRequest, SignupRequest } from '../models/auth.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload).pipe(
      tap(response => {
        if (response.user_id) {
          localStorage.setItem('user_id', response.user_id);
          localStorage.setItem('token', 'session_' + response.user_id);
        }
        if (response.name) localStorage.setItem('name', response.name);
      })
    );
  }

  signup(payload: SignupRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, payload).pipe(
      tap(response => {
        if (response.user_id) {
          localStorage.setItem('user_id', response.user_id);
          localStorage.setItem('token', 'session_' + response.user_id);
        }
        if (response.name) localStorage.setItem('name', response.name);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('user_id');
    localStorage.removeItem('name');
    localStorage.removeItem('token');
  }

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
