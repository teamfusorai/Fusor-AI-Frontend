import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { KnowledgebaseRoutingModule } from './knowledgebase-routing.module';
import { KnowledgebaseComponent } from './knowledgebase.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { TableModule } from 'primeng/table';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@NgModule({
  declarations: [
    KnowledgebaseComponent
  ],
  imports: [
    CommonModule,
    KnowledgebaseRoutingModule,
    SharedModule,
    TableModule,
    ProgressBarModule,
    ProgressSpinnerModule
  ]
})
export class KnowledgebaseModule { }
