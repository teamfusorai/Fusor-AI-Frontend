import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatbotsRoutingModule } from './chatbots-routing.module';
import { ChatbotsComponent } from './chatbots.component';


import { MenuModule } from 'primeng/menu';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    ChatbotsComponent
  ],
  imports: [
    CommonModule,
    ChatbotsRoutingModule,
    SharedModule,
    MenuModule
  ]
})
export class ChatbotsModule { }
