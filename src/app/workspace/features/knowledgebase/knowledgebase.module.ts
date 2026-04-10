import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { KnowledgebaseRoutingModule } from './knowledgebase-routing.module';
import { KnowledgebaseComponent } from './knowledgebase.component';


@NgModule({
  declarations: [
    KnowledgebaseComponent
  ],
  imports: [
    CommonModule,
    KnowledgebaseRoutingModule
  ]
})
export class KnowledgebaseModule { }
