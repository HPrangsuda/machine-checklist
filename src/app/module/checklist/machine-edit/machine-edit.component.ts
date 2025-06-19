import { Component, OnInit } from '@angular/core';
import { MachineResponse } from '../../../models/machine.model';
import { MachineService } from '../../../services/machine.service';
import { Employee } from '../../../models/employee.model';
import { EmployeeService } from '../../../services/employee.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { MachineTypeService } from '../../../services/machine-type.service';
import { MachineType } from '../../../models/machine-type.model';
import { NotifyService } from '../../../core/service/notify.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface Frequency {
  name: string;
}

interface MachineStatus {
  name: string;
}

@Component({
  selector: 'app-machine-edit',
  standalone: false,
  templateUrl: './machine-edit.component.html',
  styleUrls: ['./machine-edit.component.scss']
})
export class MachineEditComponent implements OnInit {
  machineResponse: MachineResponse | null = null;
  qrCodeImage: string | null = null;
  error: string | null = null;
  loading: boolean = false;

  employeeList: Employee[] = [];
  frequency: Frequency[] = [];
  machineStatus: MachineStatus[] = [];
  type: MachineType[] = [];
  selectedFile: File | null = null;
  previewImageSrc: string | ArrayBuffer | null = null;
  machineForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private machineService: MachineService,
    private emplService: EmployeeService,
    private machineTypeService: MachineTypeService,
    private location: Location,
    private notifyService: NotifyService,
    private fb: FormBuilder
  ) {
    this.machineForm = this.fb.group({
      department: ['', Validators.required],
      responsibleId: [null, Validators.required],
      supervisorId: [null],
      managerId: [null],
      frequency: [[]],
      status: [null, Validators.required],
      type: [null]
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!isNaN(id)) {
      this.machineService.getMachineWithQRCode(id).subscribe({
        next: (response: MachineResponse) => {
          this.machineResponse = response;
          this.qrCodeImage = 'data:image/png;base64,' + response.qrCodeImage;
          this.loadEmployeeList();
          this.loadType();
          this.loadData();
        },
        error: (err) => {
          this.error = 'ไม่สามารถโหลดข้อมูลเครื่องจักรได้';
          console.error('Error:', err);
        }
      });
    }
  }

  loadData(): void {
    this.loading = true;

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

    if (this.machineResponse?.machine?.frequency) {
      const frequencyValue = this.machineResponse.machine.frequency;
      this.machineForm.patchValue({
        frequency: typeof frequencyValue === 'string' && frequencyValue
          ? frequencyValue.split(',').map(f => f.trim()).filter(f => this.frequency.some(fq => fq.name === f))
          : []
      });
    }

    if (this.machineResponse?.machine?.machineStatus) {
      this.machineForm.patchValue({
        status: this.machineStatus.some(status => status.name === this.machineResponse!.machine.machineStatus)
          ? this.machineResponse!.machine.machineStatus
          : null
      });
    }

    if (this.machineResponse?.machine?.department) {
      this.machineForm.patchValue({
        department: this.machineResponse.machine.department
      });
    }

    this.loading = false;
  }

  loadEmployeeList(): void {
    this.emplService.getAllUser().subscribe({
      next: (employees: Employee[]) => {
        this.employeeList = [
          {
            employeeId: '',
            firstName: '',
            lastName: '',
            name: '----- กรุณาเลือก -----',
            id: 0,
            department: '',
            nickName: '',
            position: ''
          },
          ...employees.map(employee => ({
            ...employee,
            name: `${employee.firstName} ${employee.lastName}`
          }))
        ];

        if (this.machineResponse?.machine?.responsiblePersonName) {
          const responsibleEmp = this.employeeList.find(
            emp => `${emp.firstName} ${emp.lastName}` === this.machineResponse!.machine.responsiblePersonName
          );
          this.machineForm.patchValue({
            responsibleId: responsibleEmp ? responsibleEmp.employeeId : null
          });
        }

        if (this.machineResponse?.machine?.supervisorName) {
          const supervisorEmp = this.employeeList.find(
            emp => `${emp.firstName} ${emp.lastName}` === this.machineResponse!.machine.supervisorName
          );
          this.machineForm.patchValue({
            supervisorId: supervisorEmp ? supervisorEmp.employeeId : null
          });
        }

        if (this.machineResponse?.machine?.managerName) {
          const managerEmp = this.employeeList.find(
            emp => `${emp.firstName} ${emp.lastName}` === this.machineResponse!.machine.managerName
          );
          this.machineForm.patchValue({
            managerId: managerEmp ? managerEmp.employeeId : null
          });
        }
      },
      error: (err) => {
        console.error('ไม่สามารถโหลดรายชื่อพนักงานได้:', err);
        this.error = 'ไม่สามารถโหลดรายชื่อพนักงานได้';
      }
    });
  }

  loadType(): void {
    this.machineTypeService.getAllMachinesType().subscribe({
      next: (data: MachineType[]) => {
        this.type = data;
        if (this.machineResponse?.machine?.machineTypeName) {
          this.machineForm.patchValue({
            type: this.type.find(t => t.machineTypeName === this.machineResponse!.machine.machineTypeName)?.machineTypeName || null
          });
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching machine types:', err);
        this.error = 'ไม่สามารถโหลดประเภทเครื่องได้';
        this.loading = false;
      }
    });
  }

  getEmployeeId(employeeId: string | null): string | null {
    if (!employeeId) return null;
    const employee = this.employeeList.find(emp => emp.employeeId === employeeId);
    return employee ? employee.employeeId.toString() : null;
  }

  downloadQRCode(): void {
    if (this.qrCodeImage) {
      const link = document.createElement('a');
      link.href = this.qrCodeImage;
      link.download = `QRCode_${this.machineResponse?.machine?.machineCode || 'machine'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      this.error = 'ไม่มี QR Code ให้ดาวน์โหลด';
    }
  }

  saveMachine(): void {
    if (!this.machineResponse?.machine) {
      this.notifyService.msgWarn('ไม่มีข้อมูลเครื่องจักร', 'ไม่มีข้อมูลเครื่องจักรสำหรับบันทึก');
      return;
    }

    if (this.machineForm.invalid) {
      this.notifyService.msgWarn('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกข้อมูลที่จำเป็น (หน่วยงาน, ผู้รับผิดชอบ, สถานะ)');
      this.machineForm.markAllAsTouched();
      return;
    }

    const machineData = {
      id: this.machineResponse.machine.id,
      responsiblePersonId: this.machineForm.value.responsibleId || null,
      responsiblePersonName: this.getEmployeeFullName(this.machineForm.value.responsibleId) || '',
      supervisorId: this.machineForm.value.supervisorId || null,
      supervisorName: this.getEmployeeFullName(this.machineForm.value.supervisorId) || '',
      managerId: this.machineForm.value.managerId || null,
      managerName: this.getEmployeeFullName(this.machineForm.value.managerId) || '',
      frequency: this.machineForm.value.frequency?.length > 0 ? this.machineForm.value.frequency.join(',') : '',
      machineStatus: this.machineForm.value.status,
      department: this.machineForm.value.department || ''
    };

    this.loading = true;
    this.machineService.updateMachine(this.machineResponse.machine.id, machineData).subscribe({
      next: (response: MachineResponse) => {
        this.machineResponse = response;
        this.loading = false;
        this.notifyService.msgSuccess('สำเร็จ', 'อัปเดตข้อมูลเครื่องจักรเรียบร้อยแล้ว');
        console.log('Update successful:', response);
        setTimeout(() => this.location.back(), 1000);
      },
      error: (err) => {
        this.notifyService.msgWarn('เกิดข้อผิดพลาด', `ไม่สามารถอัปเดตข้อมูลเครื่องจักรได้: ${err.message || err.statusText}`);
        console.error('Update error:', err);
        this.loading = false;
      }
    });
  }

  private getEmployeeFullName(employeeId: string | null): string | null {
    if (!employeeId) return null;
    const employee = this.employeeList.find(emp => emp.employeeId === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : null;
  }

  goBack(): void {
    this.location.back();
  }
}