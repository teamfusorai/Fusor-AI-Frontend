import { Component, OnInit } from '@angular/core';
import { ChatbotWizardService } from '../services/chatbot-wizard.service';

@Component({
  selector: 'app-knowledge',
  templateUrl: './knowledge.component.html',
  styleUrls: ['./knowledge.component.scss']
})
export class KnowledgeComponent implements OnInit {
  uploadedFiles: any[] = [];

  constructor(private wizardService: ChatbotWizardService) {}

  ngOnInit(): void {
    // For now, let's mark it valid so the user can skip uploading files if they want,
    // or you can set this to false if files are physically required.
    this.wizardService.setCurrentStepValidity(true);
  }

  onFileSelect(event: any) {
    for (let file of event.files) {
      if (!this.uploadedFiles.find(f => f.name === file.name)) {
         this.uploadedFiles.push(file);
      }
    }
    // Update validity if files become required
    this.wizardService.setCurrentStepValidity(this.uploadedFiles.length > 0);
  }

  onFileRemove(event: any) {
    this.uploadedFiles = this.uploadedFiles.filter(f => f.name !== event.file.name);
    // Control Next button
    this.wizardService.setCurrentStepValidity(this.uploadedFiles.length > 0);
  }

  customUpload(event: any) {
    // Used when they actually click 'upload', simulating a finish
  }
}
