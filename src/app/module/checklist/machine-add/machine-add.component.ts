import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { MachineType } from '../../../models/machine-type.model';
import { MachineTypeService } from '../../../services/machine-type.service';
import { MessageService } from 'primeng/api';
import { StorageService } from '../../../core/service/storage.service';
import { ActivatedRoute } from '@angular/router';
import { Employee } from '../../../models/employee.model';
import { EmployeeService } from '../../../services/employee.service';
import { MachineService } from '../../../services/machine.service';
import { NotifyService } from '../../../core/service/notify.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface Frequency {
  name: string;
}

interface MachineStatus {
  name: string;
}

@Component({
  selector: 'app-machine-add',
  standalone: false,
  templateUrl: './machine-add.component.html',
  styleUrls: ['./machine-add.component.scss']
})
export class MachineAddComponent implements OnInit {
  employeeList: Employee[] = [];
  selectedEmployee: number | null = null;
  selectedSupervisor: number | null = null;
  selectedManager: number | null = null;
  frequency: Frequency[] = [];
  selectedFrequency: string[] = [];
  machineStatus: MachineStatus[] = [];
  selectedStatus: string | null = null;
  type: MachineType[] = [];
  selectedType: string | null = null;
  machineForm: FormGroup;
  loading: boolean = false;
  
  selectedFile: File | null = null;
  previewImageSrc: string | ArrayBuffer | null = null;

  constructor(
    private route: ActivatedRoute,
    private machineService: MachineService,
    private emplService: EmployeeService,
    private machineTypeService: MachineTypeService,
    private location: Location,
    private messageService: MessageService,
    private fb: FormBuilder
  ) {
    this.machineForm = this.fb.group({
      machineName: ['', Validators.required],
      model: [''],
      code: ['', Validators.required],
      number: [''],
      responsibleId: [null],
      supervisorId: [null],
      managerId: [null],
      frequency: [[]],
      status: [null],
      type: [null, Validators.required],
      note: ['']
    });
  }

  ngOnInit(): void {
    this.loadEmployeeList();
    this.loadType();
    this.loadData();
  }

  loadData(): void {

    this.frequency = [
      { name: 'ทุกวัน' },
      { name: '1 ครั้ง/สัปดาห์' },
      { name: '1 ครั้ง/เดือน' },
      { name: '1 ครั้ง/3 เดือน' },
      { name: '1 ครั้ง/6 เดือน' }
    ];

    this.machineStatus = [
      { name: 'ใช้งานได้' },
      { name: 'ไม่ได้ใช้งาน' },
      { name: 'ซ่อมบำรุง' }
    ];

  }

  loadEmployeeList(): void {
    this.emplService.getAllUser().subscribe({
      next: (employees: Employee[]) => {
        this.employeeList = employees.map(employee => ({
          ...employee,
          name: `${employee.firstName} ${employee.lastName}`
        }));
      },
      error: (err) => {
        console.error('ไม่สามารถโหลดรายชื่อพนักงานได้:', err);
      }
    });
  }

  loadType(): void {
    this.machineTypeService.getAllMachinesType().subscribe({
      next: (data: MachineType[]) => {
        this.type = data;
      },
      error: (err) => {
        console.error('Error fetching machine types:', err);
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImageSrc = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }
  clearImage(): void {
    this.selectedFile = null;
    this.previewImageSrc = null;
  }

  saveMachine(): void {
    if (this.machineForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'ข้อมูลไม่ครบถ้วน',
        detail: 'กรุณากรอกข้อมูลที่จำเป็น (ชื่อเครื่อง, รหัส, ประเภทเครื่อง)'
      });
      this.machineForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const machineData = {
      machineName: this.machineForm.value.machineName,
      model: this.machineForm.value.model || null,
      machineCode: this.machineForm.value.code,
      machineNumber: this.machineForm.value.number || null,
      responsiblePersonId: this.machineForm.value.responsibleId || null,
      supervisorId: this.machineForm.value.supervisorId || null,
      managerId: this.machineForm.value.managerId || null,
      frequency: this.machineForm.value.frequency || [],
      machineStatus: this.machineForm.value.status || null,
      machineTypeName: this.machineForm.value.type,
      note: this.machineForm.value.note || null
    };

    this.machineService.addMachine(machineData).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'สำเร็จ',
          detail: 'บันทึกเครื่องจักรเรียบร้อยแล้ว'
        });
        this.loading = false;
        setTimeout(() => this.location.back(), 1000); // กลับไปหน้าก่อนหน้าหลัง 1 วินาที
      },
      error: (err) => {
        console.error('Error saving machine:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'ข้อผิดพลาด',
          detail: 'ไม่สามารถบันทึกเครื่องจักรได้: ' + (err.error?.message || 'Unknown error')
        });
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.location.back();
  }
}
