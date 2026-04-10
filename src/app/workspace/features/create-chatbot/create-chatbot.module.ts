import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { StepsModule } from 'primeng/steps';
import { ColorPickerModule } from 'primeng/colorpicker';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextareaModule } from 'primeng/inputtextarea';

import { SharedMModule } from '../../../shared-m/shared-m.module';

import { CreateChatbotRoutingModule } from './create-chatbot-routing.module';
import { ChatbotWizardComponent } from './chatbot-wizard/chatbot-wizard.component';
import { BasicInfoComponent } from './basic-info/basic-info.component';
import { CustomizationComponent } from './customization/customization.component';
import { KnowledgeComponent } from './knowledge/knowledge.component';
import { ConfigurationComponent } from './configuration/configuration.component';
import { PublishComponent } from './publish/publish.component';
import { BotPreviewComponent } from './bot-preview/bot-preview.component';

@NgModule({
  declarations: [
    ChatbotWizardComponent,
    BasicInfoComponent,
    CustomizationComponent,
    KnowledgeComponent,
    ConfigurationComponent,
    PublishComponent,
    BotPreviewComponent
  ],
  imports: [
    CommonModule,
    CreateChatbotRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    StepsModule,
    ColorPickerModule,
    FileUploadModule,
    InputTextareaModule,
    SharedMModule
  ]
})
export class CreateChatbotModule { }
