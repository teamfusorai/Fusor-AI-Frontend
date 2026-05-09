import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ChatbotSummary } from '../models/chatbot.model';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  createChatbot(payload: FormData): Observable<{ message: string; bot_id: string }> {
    return this.http.post<{ message: string; bot_id: string }>(`${this.apiUrl}/chatbots`, payload);
  }

  getChatbots(userId: string): Observable<ChatbotSummary[]> {
    return this.http.get<ChatbotSummary[]>(`${this.apiUrl}/chatbots?user_id=${userId}`);
  }

  getChatbotById(botId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/chatbots/${botId}`);
  }

  updateChatbot(botId: string, payload: FormData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/chatbots/${botId}`, payload);
  }

  deleteChatbot(userId: string, botId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/chatbots/${userId}/${botId}`);
  }

  submitFeedback(botId: string, type: 'up' | 'down'): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/chatbots/${botId}/feedback`, { type });
  }

  trackConversation(botId: string, visitorId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/chatbots/${botId}/track/conversation`, { visitor_id: visitorId });
  }
}
