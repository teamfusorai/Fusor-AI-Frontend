import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatbotSummary } from '../models/chatbot.model';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) { }

  createChatbot(payload: FormData): Observable<{ message: string; bot_id: string }> {
    return this.http.post<{ message: string; bot_id: string }>(`${this.apiUrl}/chatbots`, payload);
  }

  getChatbots(userId: string): Observable<ChatbotSummary[]> {
    return this.http.get<ChatbotSummary[]>(`${this.apiUrl}/chatbots?user_id=${userId}`);
  }

  deleteChatbot(userId: string, botId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/chatbots/${userId}/${botId}`);
  }
}
