import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RecheckComponent } from './recheck/recheck.component';
import { RecheckDetailComponent } from './recheck-detail/recheck-detail.component';
import { ChecklistComponent } from './checklist/checklist.component';
import { MachineListComponent } from './machine-list/machine-list.component';
import { HistoryComponent } from './history/history.component';
import { ChecklistDetailComponent } from './checklist-detail/checklist-detail.component';
import { MachineResponsibleComponent } from './machine-responsible/machine-responsible.component';
import { MachineDetailComponent } from './machine-detail/machine-detail.component';
import { AuthGuard } from '../../core/guard/auth.guard';
import { MachineEditComponent } from './machine-edit/machine-edit.component';
import { MachineAddComponent } from './machine-add/machine-add.component';
import { UserAddComponent } from './user-add/user-add.component';
import { UserListComponent } from './user-list/user-list.component';
import { UserEditComponent } from './user-edit/user-edit.component';
import { KpiReportComponent } from './kpi-report/kpi-report.component';
import { KpiReportDetailComponent } from './kpi-report-detail/kpi-report-detail.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
    },
    {
        path: 'dashboard',
        canActivate: [AuthGuard],
        component: DashboardComponent,
    },
    {
        path: 'recheck',
        canActivate: [AuthGuard],
        component: RecheckComponent,
    },
    {
        path: 'recheck-detail/:id',
        canActivate: [AuthGuard],
        component: RecheckDetailComponent,
    },
    {
        path: 'checklist/:machineCode',
        canActivate: [AuthGuard],
        component: ChecklistComponent,
    },
    {
        path: 'history',
        canActivate: [AuthGuard],
        component: HistoryComponent,
    },
    {
        path: 'machine-list',
        canActivate: [AuthGuard],
        component: MachineListComponent,
    },
    {
        path: 'checklist-detail/:id',
        canActivate: [AuthGuard],
        component: ChecklistDetailComponent,
    },
    {
        path: 'machine-responsible',
        canActivate: [AuthGuard],
        component: MachineResponsibleComponent,
    },
    {
        path: 'machine-detail/:id',
        canActivate: [AuthGuard],
        component: MachineDetailComponent,
    },
    {
        path: 'machine-edit/:id',
        canActivate: [AuthGuard],
        component: MachineEditComponent
    },
    {
        path: 'machine-add',
        canActivate: [AuthGuard],
        component: MachineAddComponent
    },
    {
        path: 'user-list',
        canActivate: [AuthGuard],
        component: UserListComponent
    },
    {
        path: 'user-add',
        canActivate: [AuthGuard],
        component: UserAddComponent
    },
    {
        path: 'user-edit/:id',
        canActivate: [AuthGuard],
        component: UserEditComponent
    },
    {
        path: 'kpi-report',
        canActivate: [AuthGuard],   
        component: KpiReportComponent
    },
    {
        path: 'kpi-report-detail/:userId',
        canActivate: [AuthGuard],   
        component: KpiReportDetailComponent
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ChecklistRoutingModule { }