import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { QuestionComponent } from './question/question.component';
import { AnswerComponent } from './answer/answer.component';
import { MachineListComponent } from './machine-list/machine-list.component';
import { ChecklistComponent } from './checklist/checklist.component';
import { MachineTypeComponent } from './machine-type/machine-type.component';
import { ChecklistRoutingModule } from './checklist-routing.module';
import { RecheckComponent } from './recheck/recheck.component';
import { RecheckDetailComponent } from './recheck-detail/recheck-detail.component';
import { ProfileComponent } from './profile/profile.component';
import { HistoryComponent } from './history/history.component';
import { MachineResponsibleComponent } from './machine-responsible/machine-responsible.component';
import { MachineDetailComponent } from './machine-detail/machine-detail.component';
import { ChecklistDetailComponent } from './checklist-detail/checklist-detail.component';
import { MachineEditComponent } from './machine-edit/machine-edit.component';
import { MachineAddComponent } from './machine-add/machine-add.component';

@NgModule({
  declarations: [
    DashboardComponent,
    QuestionComponent,
    AnswerComponent,
    MachineListComponent,
    ChecklistComponent,
    MachineTypeComponent,
    RecheckComponent,
    RecheckDetailComponent,
    ProfileComponent,
    HistoryComponent,
    MachineResponsibleComponent,
    MachineDetailComponent,
    ChecklistDetailComponent,
    MachineEditComponent,
    MachineAddComponent
  ],
  imports: [
    CommonModule,
    ChecklistRoutingModule,
    SharedModule
  ]
})
export class ChecklistModule { }
