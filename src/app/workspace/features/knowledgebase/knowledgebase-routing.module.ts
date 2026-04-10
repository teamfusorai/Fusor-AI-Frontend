import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { KnowledgebaseComponent } from './knowledgebase.component';

const routes: Routes = [{ path: '', component: KnowledgebaseComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KnowledgebaseRoutingModule { }
