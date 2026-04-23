import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkspaceLayoutComponent } from './layout/workspace-layout/workspace-layout.component';
import { authGuard } from '../guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: WorkspaceLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'create-chatbot', pathMatch: 'full' },
      { path: 'create-chatbot', loadChildren: () => import('./features/create-chatbot/create-chatbot.module').then(m => m.CreateChatbotModule) },
      { path: 'dashboard', loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule) },
      { path: 'chatbots', loadChildren: () => import('./features/chatbots/chatbots.module').then(m => m.ChatbotsModule) },
      { path: 'knowledgebase', loadChildren: () => import('./features/knowledgebase/knowledgebase.module').then(m => m.KnowledgebaseModule) },
      { path: 'analytics', loadChildren: () => import('./features/analytics/analytics.module').then(m => m.AnalyticsModule) },
      { path: 'settings', loadChildren: () => import('./features/settings/settings.module').then(m => m.SettingsModule) }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkspaceRoutingModule { }
