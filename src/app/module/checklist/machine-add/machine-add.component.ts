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
  filteredEmployees: Employee[] = [];
  frequency: Frequency[] = [];
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
      department: [''],
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
        this.employeeList = [
          {
            id: 0,
            employeeId: '',
            firstName: '',
            lastName: '',
            name: '----- กรุณาเลือก -----',
            department: '',
            nickName: '',
            position: ''
          },
          ...employees.map(employee => ({
            ...employee,
            name: `${employee.firstName} ${employee.lastName}`
          }))
        ];
        this.filteredEmployees = this.employeeList;
      },
      error: (err: any) => {
        console.error('ไม่สามารถโหลดรายชื่อพนักงานได้:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'ข้อผิดพลาด',
          detail: 'ไม่สามารถโหลดรายชื่อพนักงานได้'
        });
      }
    });
  }

  loadType(): void {
    this.machineTypeService.getAllMachinesType().subscribe({
      next: (data: MachineType[]) => {
        this.type = data;
      },
      error: (err: any) => {
        console.error('Error fetching machine types:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'ข้อผิดพลาด',
          detail: 'ไม่สามารถโหลดประเภทเครื่องได้'
        });
      }
    });
  }

  filterEmployees(event: any): void {
    const query = event.query.toLowerCase();
    this.filteredEmployees = this.employeeList.filter(employee =>
      employee.name?.toLowerCase().includes(query)
    );
  }

  onResponsibleChange(event: any): void {
    const selectedEmployee = event.value;
    this.machineForm.get('responsibleId')?.setValue(selectedEmployee ? selectedEmployee : null);
  }

  onResponsibleClear(): void {
    this.machineForm.get('responsibleId')?.setValue(null);
  }

  onSupervisorChange(event: any): void {
    const selectedEmployee = event.value;
    this.machineForm.get('supervisorId')?.setValue(selectedEmployee ? selectedEmployee : null);
  }

  onSupervisorClear(): void {
    this.machineForm.get('supervisorId')?.setValue(null);
  }

  onManagerChange(event: any): void {
    const selectedEmployee = event.value;
    this.machineForm.get('managerId')?.setValue(selectedEmployee ? selectedEmployee : null);
  }

  onManagerClear(): void {
    this.machineForm.get('managerId')?.setValue(null);
  }

  getEmployeeId(employee: Employee | null): string | null {
    return employee ? employee.employeeId.toString() : null;
  }

  onFileSelected(event: any): void {
    const file = event.files[0];
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
    const selectedFrequency = this.machineForm.get('frequency')?.value;
    const machineData = {
      machineName: this.machineForm.value.machineName,
      machineModel: this.machineForm.value.model || null,
      machineCode: this.machineForm.value.code,
      machineNumber: this.machineForm.value.number || null,
      department: this.machineForm.value.department || null,
      responsiblePersonId: this.machineForm.value.responsibleId ? this.machineForm.value.responsibleId.employeeId : null,
      responsiblePersonName: this.getEmployeeFullName(this.machineForm.value.responsibleId) || null,
      supervisorId: this.machineForm.value.supervisorId ? this.machineForm.value.supervisorId.employeeId : null,
      supervisorName: this.getEmployeeFullName(this.machineForm.value.supervisorId) || null,
      managerId: this.machineForm.value.managerId ? this.machineForm.value.managerId.employeeId : null,
      managerName: this.getEmployeeFullName(this.machineForm.value.managerId) || null,
      frequency: selectedFrequency && selectedFrequency.length > 0 ? selectedFrequency.join(',') : null,
      machineStatus: this.machineForm.value.status || null,
      machineTypeName: this.machineForm.value.type,
      note: this.machineForm.value.note || null
    };

    console.log('Machine Data:', machineData);
    this.machineService.addMachine(machineData, this.selectedFile || undefined).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'สำเร็จ',
          detail: 'บันทึกเครื่องจักรเรียบร้อยแล้ว'
        });
        this.loading = false;
        setTimeout(() => this.location.back(), 1000);
      },
      error: (err: any) => {
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

  getEmployeeFullName(employee: Employee | null): string | null {
    return employee ? `${employee.firstName} ${employee.lastName}` : null;
  }

  goBack(): void {
    this.location.back();
  }
}