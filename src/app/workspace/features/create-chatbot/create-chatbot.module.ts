import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CreateChatbotRoutingModule } from './create-chatbot-routing.module';
// import { CreateChatbotComponent } from '../create-chatbot.component';
import { CreateChatbotComponent } from './create-chatbot.component';
import { BasicInfoComponent } from './components/basic-info/basic-info.component';
import { CustomizationComponent } from './components/customization/customization.component';
import { KnowledgeComponent } from './components/knowledge/knowledge.component';
import { ConfigurationComponent } from './components/configuration/configuration.component';
import { PublishComponent } from './components/publish/publish.component';

@NgModule({
  declarations: [
    CreateChatbotComponent,
    BasicInfoComponent,
    CustomizationComponent,
    KnowledgeComponent,
    ConfigurationComponent,
    PublishComponent
  ],
  imports: [
    CommonModule,
    CreateChatbotRoutingModule
  ]
})
export class CreateChatbotModule { }
