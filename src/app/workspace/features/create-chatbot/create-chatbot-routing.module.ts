import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateChatbotComponent } from './create-chatbot.component';

const routes: Routes = [{ path: '', component: CreateChatbotComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateChatbotRoutingModule { }
