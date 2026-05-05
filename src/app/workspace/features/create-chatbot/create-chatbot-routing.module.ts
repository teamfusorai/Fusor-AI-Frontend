import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateChatbotComponent } from './create-chatbot.component';
import { BasicInfoComponent } from './components/basic-info/basic-info.component';
import { CustomizationComponent } from './components/customization/customization.component';
import { KnowledgeComponent } from './components/knowledge/knowledge.component';
import { ConfigurationComponent } from './components/configuration/configuration.component';
import { PublishComponent } from './components/publish/publish.component';

const routes: Routes = [{ 
  path: '',
  component: CreateChatbotComponent,
  children: [
    {path: '', redirectTo: 'basic-info', pathMatch: 'full'},
    {path: 'basic-info', component: BasicInfoComponent},
    {path: 'customization', component: CustomizationComponent},
    {path: 'knowledge', component: KnowledgeComponent},
    {path: 'configuration', component: ConfigurationComponent},
    {path: 'publish', component: PublishComponent}
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateChatbotRoutingModule { }
