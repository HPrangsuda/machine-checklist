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

  selectedFile: File | null = null;
  previewImageSrc: string | ArrayBuffer | null = null;

  constructor(
    private route: ActivatedRoute,
    private machineService: MachineService,
    private emplService: EmployeeService,
    private machineTypeService: MachineTypeService,
    private location: Location,
    private notifyService: NotifyService
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
      this.selectedFrequency = typeof frequencyValue === 'string' && frequencyValue
        ? frequencyValue.split(',').map(f => f.trim()).filter(f => this.frequency.some(fq => fq.name === f))
        : [];
    } else {
      this.selectedFrequency = [];
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

  onFileSelected(event: any): void {
    const file: File = event.files[0]; // Use PrimeNG's event.files
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
    if (!this.machineResponse?.machine) {
      this.error = 'ไม่มีข้อมูลเครื่องจักรสำหรับบันทึก';
      return;
    }

    const formData = new FormData();

    // Append machine details
    formData.append('id', this.machineResponse.machine.id.toString());
    formData.append('machineName', this.machineResponse.machine.machineName || '');
    formData.append('machineModel', this.machineResponse.machine.machineModel || '');
    formData.append('machineCode', this.machineResponse.machine.machineCode || '');
    formData.append('machineNumber', this.machineResponse.machine.machineNumber || '');
    formData.append('responsiblePersonId', this.selectedEmployee?.toString() || '');
    formData.append('responsiblePersonName', this.getEmployeeFullName(this.selectedEmployee) || '');
    formData.append('supervisorId', this.selectedSupervisor?.toString() || '');
    formData.append('supervisorName', this.getEmployeeFullName(this.selectedSupervisor) || '');
    formData.append('managerId', this.selectedManager?.toString() || '');
    formData.append('managerName', this.getEmployeeFullName(this.selectedManager) || '');
    formData.append('frequency', this.selectedFrequency && this.selectedFrequency.length > 0 ? this.selectedFrequency.join(',') : '');
    formData.append('machineStatus', this.selectedStatus || '');
    formData.append('machineTypeName', this.selectedType || '');

    // Append image only if a new one is selected
    if (this.selectedFile) {
      formData.append('image', this.selectedFile, this.selectedFile.name);
    } else if (this.machineResponse.machine.image) {
      // Optionally send existing image URL to ensure backend retains it
      formData.append('existingImage', this.machineResponse.machine.image);
    }

    this.loading = true;
    this.machineService.updateMachine(this.machineResponse.machine.id, formData).subscribe({
      next: (response: MachineResponse) => {
        this.machineResponse = response;
        this.previewImageSrc = null; // Clear preview after successful save
        this.selectedFile = null; // Clear selected file
        this.loading = false;
        this.notifyService.msgSuccess('สำเร็จ', 'อัปเดตข้อมูลเครื่องจักรเรียบร้อยแล้ว');
        console.log('Update successful:', response);
      },
      error: (err) => {
        this.notifyService.msgWarn('ผิดพลาด', 'ไม่สามารถอัปเดตข้อมูลเครื่องจักรได้');
        console.error('Update error:', err);
        this.loading = false;
      }
    });
  }

  private getEmployeeFullName(employeeId: number | null): string | null {
    if (!employeeId) return null;
    const employee = this.employeeList.find(emp => emp.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : null;
  }

  goBack(): void {
    this.location.back();
  }
}