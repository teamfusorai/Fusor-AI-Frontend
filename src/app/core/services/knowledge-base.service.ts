import { Injectable } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KnowledgeBaseService {
  constructor() {}

  ingest(type: 'file' | 'url', payload: File | string): Observable<{ id: string }> {
    // Mock implementation for ingestion. Replace with actual HTTP call.
    if (!payload) {
      return throwError(() => new Error('Payload is missing'));
    }
    const mockId = Math.random().toString(36).substring(2, 10);
    return of({ id: `doc_${mockId}` }).pipe(delay(1500)); // Simulate network delay
  }
}
