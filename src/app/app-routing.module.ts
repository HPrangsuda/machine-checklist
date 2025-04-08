import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TemplateComponent } from './layout/template/template.component';
import { AuthGuard } from './core/guard/auth.guard';

const routes: Routes = [
  {
    path: 'authentication',
    loadChildren: () => import('./module/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: '',
    component: TemplateComponent,
    loadChildren: () => import('./module/checklist/checklist.module').then((m) => m.ChecklistModule),
  },
  { path: '**', redirectTo:'authentication' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
