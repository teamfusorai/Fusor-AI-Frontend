import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DashboardMetrics, AnalyticsResponse } from '../models/dashboard.model';
import { ChatbotSummary } from '../models/chatbot.model';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /** Used by DashboardComponent (backward-compatible) */
  getUserAnalytics(userId: string): Observable<DashboardMetrics> {
    return this.http.get<DashboardMetrics>(`${this.apiUrl}/analytics/${userId}`);
  }

  /** Full analytics dashboard data with optional bot filter */
  getAnalyticsDashboard(userId: string, botId?: string): Observable<AnalyticsResponse> {
    let params = new HttpParams();
    if (botId) {
      params = params.set('bot_id', botId);
    }
    return this.http.get<AnalyticsResponse>(`${this.apiUrl}/analytics/${userId}`, { params });
  }

  /** Get chatbot list for the filter dropdown */
  getChatbotsList(userId: string): Observable<ChatbotSummary[]> {
    return this.http.get<ChatbotSummary[]>(`${this.apiUrl}/chatbots/${userId}`);
  }
}
