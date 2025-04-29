import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// PrimeNG Components
import { InputTextModule } from 'primeng/inputtext';
import { DataViewModule } from 'primeng/dataview';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { FieldsetModule } from 'primeng/fieldset';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { FileUploadModule } from 'primeng/fileupload';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { RippleModule } from 'primeng/ripple';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { SpeedDialModule } from 'primeng/speeddial';
import { IftaLabelModule } from 'primeng/iftalabel';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ConfirmDialog
  ],
  exports: [
    // Angular Modules
    FormsModule,
    ReactiveFormsModule,
    // PrimeNG Modules
    InputTextModule,
    DataViewModule,
    TagModule,
    CardModule,
    FieldsetModule,
    ButtonModule,
    TextareaModule,
    FileUploadModule,
    IconFieldModule,
    InputIconModule,
    MultiSelectModule,
    ToolbarModule,
    DialogModule,
    RippleModule,
    DropdownModule,
    InputSwitchModule,
    ToastModule,
    TableModule,
    SelectModule,
    SpeedDialModule,
    IftaLabelModule,
    ConfirmDialogModule,
    ConfirmDialog,
    ProgressSpinnerModule,
    PaginatorModule,
    SkeletonModule
  ],
  providers: [ConfirmationService, MessageService]
})
export class SharedModule {
  getRoleClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'รอดำเนินการ' : return 'tag-danger';
      case 'รอหัวหน้างานตรวจสอบ': return 'tag-warn';
      case 'รอผู้จัดการฝ่ายตรวจสอบ': return 'tag-orange';
      case 'ดำเนินการเสร็จสิ้น': return 'tag-success';
      case 'ใช้งานได้': return 'tag-success';
      case 'ไม่ได้ใช้งาน': return 'tag-warn';
      case 'ซ่อมบำรุง': return 'tag-danger';
      
      default: return 'tag-secondary';
    }
  }
}
