import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DeploymentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getQrCode(userId: string, botId: string): Observable<{ qr_code_base64: string; qr_code_url: string }> {
    return this.http.get<{ qr_code_base64: string; qr_code_url: string }>(
      `${this.apiUrl}/qr-code/${userId}/${botId}?include_base64=true`
    );
  }

  getEmbedSnippet(userId: string, botId: string): Observable<{ snippet: string; api_base_url: string }> {
    return this.http.get<{ snippet: string; api_base_url: string }>(
      `${this.apiUrl}/embed/snippet?user_id=${userId}&bot_id=${botId}`
    );
  }
}
