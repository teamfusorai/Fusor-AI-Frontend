import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timer, throwError, of } from 'rxjs';
import { switchMap, takeWhile, filter, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { KnowledgeBaseItem, KnowledgeBaseResponse } from '../models/knowledgebase.model';

@Injectable({
  providedIn: 'root'
})
export class KnowledgeBaseService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /** Bot-scoped ingestion (used by create-chatbot wizard) */
  ingest(type: 'file' | 'url', payload: File | string, userId: string): Observable<any> {
    if (!payload) {
      return throwError(() => new Error('Payload is missing'));
    }

    let formData = new FormData();
    formData.append('user_id', userId);

    if (type === 'file' && payload instanceof File) {
      formData.append('file', payload);
    } else if (type === 'url' && typeof payload === 'string') {
      formData.append('url', payload);
    }

    return this.http.post<any>(`${this.apiUrl}/knowledge-bases`, formData).pipe(
      switchMap(response => {
        if (response.status === 'queued' && response.job_id) {
          return this.pollJobStatus(response.job_id);
        }
        return of(response);
      })
    );
  }

  private pollJobStatus(jobId: string): Observable<any> {
    return timer(0, 2000).pipe(
      switchMap(() => this.http.get<any>(`${this.apiUrl}/ingest/status/${jobId}`)),
      takeWhile(response => response.status !== 'SUCCESS' && response.status !== 'FAILURE', true),
      filter(response => response.status === 'SUCCESS' || response.status === 'FAILURE'),
      switchMap(response => {
        if (response.status === 'FAILURE') {
          return throwError(() => new Error(response.error || 'Ingestion job failed'));
        }
        return of(response);
      })
    );
  }

  /** Bot-scoped endpoints (backward-compatible) */
  getKnowledgeBases(userId: string, botId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/knowledge-bases`, {
      params: { user_id: userId, bot_id: botId }
    });
  }

  getKnowledgeBaseStats(userId: string, botId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/knowledge-bases/${userId}/${botId}/stats`);
  }

  getKnowledgeBaseDocuments(userId: string, botId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/knowledge-bases/${userId}/${botId}/documents`);
  }

  deleteKnowledgeBase(userId: string, botId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/knowledge-bases/${userId}/${botId}`);
  }

  /** ──────── Global KB Management Page Methods ──────── */

  /** Get all documents and stats for a user (global, across all bots) */
  getAllDocuments(userId: string): Observable<KnowledgeBaseResponse> {
    return this.http.get<KnowledgeBaseResponse>(
      `${this.apiUrl}/knowledge-bases/${userId}`
    );
  }

  /** Upload a file document */
  uploadFile(userId: string, file: File): Observable<KnowledgeBaseItem> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', userId);
    return this.http.post<KnowledgeBaseItem>(
      `${this.apiUrl}/knowledge-bases`, formData
    );
  }

  /** Add a URL source */
  addUrl(userId: string, url: string): Observable<KnowledgeBaseItem> {
    const formData = new FormData();
    formData.append('url', url);
    formData.append('user_id', userId);
    return this.http.post<KnowledgeBaseItem>(
      `${this.apiUrl}/knowledge-bases`, formData
    );
  }

  /** Check processing status of a document */
  getDocumentStatus(kbId: string): Observable<{ status: string }> {
    return this.http.get<{ status: string }>(
      `${this.apiUrl}/knowledge-bases/${kbId}/status`
    );
  }

  /** Delete a specific document */
  deleteDocument(kbId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/knowledge-bases/${kbId}`);
  }

  /** Poll document status until it's no longer Processing */
  pollDocumentStatus(kbId: string): Observable<any> {
    return timer(2000, 3000).pipe(
      switchMap(() => this.getDocumentStatus(kbId)),
      takeWhile(res => res.status === 'Processing', true),
      filter(res => res.status !== 'Processing')
    );
  }
}
