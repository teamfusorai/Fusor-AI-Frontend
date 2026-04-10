import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatbotWizardComponent } from './chatbot-wizard/chatbot-wizard.component';
import { BasicInfoComponent } from './basic-info/basic-info.component';
import { CustomizationComponent } from './customization/customization.component';
import { KnowledgeComponent } from './knowledge/knowledge.component';
import { ConfigurationComponent } from './configuration/configuration.component';
import { PublishComponent } from './publish/publish.component';
import { ChatbotWizardGuard } from './guards/chatbot-wizard.guard';

const routes: Routes = [
  { 
    path: '', 
    component: ChatbotWizardComponent,
    canDeactivate: [ChatbotWizardGuard],
    children: [
      { path: '', redirectTo: 'basic-info', pathMatch: 'full' },
      { path: 'basic-info', component: BasicInfoComponent },
      { path: 'customization', component: CustomizationComponent },
      { path: 'knowledge', component: KnowledgeComponent },
      { path: 'configuration', component: ConfigurationComponent },
      { path: 'publish', component: PublishComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateChatbotRoutingModule { }
