import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface OpenAiKeyStatus {
  has_openai_key: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserSettingsService {
  private readonly apiUrl = environment.apiUrl;

  /** Optional reads should not trigger global error toasts (404 until BE deployed, etc.). */
  private readonly silentHeaders = new HttpHeaders({
    'X-Skip-Global-Error': 'true'
  });

  constructor(private http: HttpClient) {}

  getOpenAiKeyStatus(userId: string): Observable<OpenAiKeyStatus> {
    return this.http.get<OpenAiKeyStatus>(
      `${this.apiUrl}/users/${encodeURIComponent(userId)}/openai-key-status`,
      { headers: this.silentHeaders }
    );
  }

  saveOpenAiApiKey(userId: string, openaiApiKey: string): Observable<{ message: string; has_openai_key: boolean }> {
    return this.http.put<{ message: string; has_openai_key: boolean }>(
      `${this.apiUrl}/users/${encodeURIComponent(userId)}/openai-api-key`,
      { openai_api_key: openaiApiKey }
    );
  }

  removeOpenAiApiKey(userId: string): Observable<{ message: string; has_openai_key: boolean }> {
    return this.http.delete<{ message: string; has_openai_key: boolean }>(
      `${this.apiUrl}/users/${encodeURIComponent(userId)}/openai-api-key`
    );
  }
}
