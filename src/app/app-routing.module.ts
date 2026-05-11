import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatPageComponent } from './chat-page/chat-page.component';

const routes: Routes =
  [
    {
      path: 'chat/:id',
      component: ChatPageComponent
    },
    {
      path: 'auth',
      loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
    },
    {
      path: '',
      loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
    },
    {
      path: 'workspace',
      loadChildren: () => import('./workspace/workspace.module').then(m => m.WorkspaceModule)
    },
    {
      path: '**',
      redirectTo: '',
      pathMatch: 'full'
    }
  ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
