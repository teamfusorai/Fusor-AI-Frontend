import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatbotsRoutingModule } from './chatbots-routing.module';
import { ChatbotsComponent } from './chatbots.component';


@NgModule({
  declarations: [
    ChatbotsComponent
  ],
  imports: [
    CommonModule,
    ChatbotsRoutingModule
  ]
})
export class ChatbotsModule { }
