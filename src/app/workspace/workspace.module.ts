import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkspaceRoutingModule } from './workspace-routing.module';
import { SharedModule } from '../shared/shared.module';
import { WorkspaceLayoutComponent } from './layout/workspace-layout/workspace-layout.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { HeaderComponent } from './layout/header/header.component';

@NgModule({
  declarations: [
    WorkspaceLayoutComponent,
    SidebarComponent,
    HeaderComponent
  ],
  imports: [
    CommonModule,
    WorkspaceRoutingModule,
    SharedModule // Reuse inputs and buttons
  ]
})
export class WorkspaceModule { }
