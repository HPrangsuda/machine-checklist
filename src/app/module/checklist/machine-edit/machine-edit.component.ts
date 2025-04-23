import { Component, OnInit } from '@angular/core';
import { MachineResponse } from '../../../models/machine.model';
import { MachineService } from '../../../services/machine.service';
import { Employee } from '../../../models/employee.model';
import { EmployeeService } from '../../../services/employee.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { MachineTypeService } from '../../../services/machine-type.service';
import { MachineType } from '../../../models/machine-type.model';

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
  selectedEmployee: number | null = null;
  selectedSupervisor: number | null = null;
  selectedManager: number | null = null;
  frequency: Frequency[] = [];
  selectedFrequency: string[] = [];
  machineStatus: MachineStatus[] = [];
  selectedStatus: string | null = null;
  type: MachineType[] = [];
  selectedType: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private machineService: MachineService,
    private emplService: EmployeeService,
    private machineTypeService: MachineTypeService,
    private location: Location
  ) {}

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
      this.selectedFrequency = Array.isArray(frequencyValue)
        ? frequencyValue.filter(f => this.frequency.some(fq => fq.name === f))
        : this.frequency.some(fq => fq.name === frequencyValue)
        ? [frequencyValue]
        : [];
    }

    if (this.machineResponse?.machine?.machineStatus) {
      this.selectedStatus = this.machineStatus.some(status => status.name === this.machineResponse!.machine.machineStatus)
        ? this.machineResponse!.machine.machineStatus
        : null;
    }

    this.loading = false;
  }

  loadEmployeeList(): void {
    this.emplService.getAllUser().subscribe({
      next: (employees: Employee[]) => {
        this.employeeList = employees.map(employee => ({
          ...employee,
          name: `${employee.firstName} ${employee.lastName}`
        }));

        if (this.machineResponse?.machine?.responsiblePersonName) {
          const responsibleEmp = this.employeeList.find(
            emp => `${emp.firstName} ${emp.lastName}` === this.machineResponse!.machine.responsiblePersonName
          );
          this.selectedEmployee = responsibleEmp ? responsibleEmp.id : null;
        }

        if (this.machineResponse?.machine?.supervisorName) {
          const supervisorEmp = this.employeeList.find(
            emp => `${emp.firstName} ${emp.lastName}` === this.machineResponse!.machine.supervisorName
          );
          this.selectedSupervisor = supervisorEmp ? supervisorEmp.id : null;
        }

        if (this.machineResponse?.machine?.managerName) {
          const managerEmp = this.employeeList.find(
            emp => `${emp.firstName} ${emp.lastName}` === this.machineResponse!.machine.managerName
          );
          this.selectedManager = managerEmp ? managerEmp.id : null;
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
          this.selectedType = this.type.find(t => t.machineTypeName === this.machineResponse!.machine.machineTypeName)?.machineTypeName || null;
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
      this.error = 'ไม่มีข้อมูลเครื่องจักรสำหรับบันทึก';
      return;
    }
  
    // สร้าง object สำหรับอัพเดท โดยตรวจสอบ null/undefined
    const updatedMachine = {
      ...this.machineResponse.machine,
      responsiblePersonId: this.selectedEmployee || null,
      responsiblePersonName: this.getEmployeeFullName(this.selectedEmployee),
      supervisorId: this.selectedSupervisor || null,
      supervisorName: this.getEmployeeFullName(this.selectedSupervisor),
      managerId: this.selectedManager || null,
      managerName: this.getEmployeeFullName(this.selectedManager),
      frequency: this.selectedFrequency || null,
      machineStatus: this.selectedStatus || null,
      machineTypeId: this.getMachineTypeId(),
      machineTypeName: this.selectedType || null
    };
  
  
    this.loading = true;
    this.machineService.updateMachine(this.machineResponse.machine.id, updatedMachine)
      .subscribe({
        next: (response: MachineResponse) => {
          this.machineResponse = response;
          this.error = null;
          this.loading = false;
          console.log('Update successful:', response);
        },
        error: (err) => {
          this.error = 'ไม่สามารถบันทึกข้อมูลเครื่องจักรได้';
          console.error('Update error:', err);
          this.loading = false;
        }
      });
  }
  
  // Helper methods
  private getEmployeeFullName(employeeId: number | null): string | null {
    if (!employeeId) return null;
    const employee = this.employeeList.find(emp => emp.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : null;
  }
  
  private getMachineTypeId(): number | null {
    const type = this.type.find(t => t.machineTypeName === this.selectedType);
    return type ? type.id : null;
  }

  goBack(): void {
    this.location.back();
  }
}