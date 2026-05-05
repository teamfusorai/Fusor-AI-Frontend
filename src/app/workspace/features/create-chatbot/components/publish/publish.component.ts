import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ChatbotStateService, DeploymentState } from 'src/app/core/services/chatbot-state.service';

@Component({
  selector: 'app-publish',
  templateUrl: './publish.component.html',
  styleUrls: ['./publish.component.scss']
})
export class PublishComponent implements OnInit {
  deploymentState$!: Observable<DeploymentState | null>;

  constructor(private state: ChatbotStateService) { }

  ngOnInit() {
    this.deploymentState$ = this.state.deploymentState$;
    // We also set the step validity to true because we can always move past this, or we just rely on the existing logic
    this.state.setStepValidity(true);
  }
}
