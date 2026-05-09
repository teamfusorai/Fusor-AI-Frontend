import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { QueryRequest, QueryResponse } from '../models/chat.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  sendQuery(payload: QueryRequest): Observable<QueryResponse> {
    return this.http.post<QueryResponse>(`${this.apiUrl}/query`, payload);
  }

  clearHistory(userId: string, botId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/chat/clear-history/${userId}/${botId}`, {});
  }
}
