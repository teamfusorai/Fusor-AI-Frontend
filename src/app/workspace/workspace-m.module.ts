import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkspaceRoutingModule } from './workspace-m-routing.module';
import { SharedMModule } from '../shared-m/shared-m.module';
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
    SharedMModule // Reuse inputs and buttons
  ]
})
export class WorkspaceModule { }