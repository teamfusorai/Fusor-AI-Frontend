import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChatbotStateService, DeploymentState } from 'src/app/core/services/chatbot-state.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-publish',
  templateUrl: './publish.component.html',
  styleUrls: ['./publish.component.scss']
})
export class PublishComponent implements OnInit {
  deploymentState$!: Observable<DeploymentState | null>;
  mappedData$!: Observable<any>;

  constructor(private state: ChatbotStateService) { }

  ngOnInit() {
    this.deploymentState$ = this.state.deploymentState$;
    this.mappedData$ = this.deploymentState$.pipe(
      map(state => state ? {
        qrCodeUrl: state.qr_code_base64,
        embedCode: state.snippet,
        apiUrl: state.endpoint_url,
        apiKey: state.api_key || ''
      } : {
        qrCodeUrl: 'placeholder',
        embedCode: '<script src="https://fusor.ai/embed.js" data-bot-id="abc123"></script>',
        apiUrl: `${environment.apiUrl}/chat/<your-bot-id>`,
        apiKey: ''
      })
    );
    this.state.setStepValidity(true);
  }
}
