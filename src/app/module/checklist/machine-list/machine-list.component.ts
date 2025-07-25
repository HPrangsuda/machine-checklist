import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Machine } from '../../../models/machine.model';
import { MachineService } from '../../../services/machine.service';
import { StorageService } from '../../../core/service/storage.service';
import { PaginatorState } from 'primeng/paginator';
import { saveAs } from 'file-saver';
import { ChecklistRecordsService } from '../../../services/checklist-records.service';

interface Frequency {
  name: string;
}

interface MachineStatus {
  name: string;
}

interface Employee {
  id: string;
  name: string;
  department: string;
}

@Component({
  selector: 'app-machine-list',
  standalone: false,
  templateUrl: './machine-list.component.html',
  styleUrls: ['./machine-list.component.scss']
})
export class MachineListComponent implements OnInit {
  items: MenuItem[] | undefined;
  role: string | undefined;
  machines: Machine[] = [];
  filteredMachines: Machine[] = [];
  loading: boolean = true;
  searchQuery: string = '';
  selectedMachineStatus: string = '';
  selectedCheckStatus: string = '';
  
  first: number = 0;
  rows: number = 5;
  
  displayAddDialog: boolean = false;
  displayEditDialog: boolean = false;
  employee: Employee[] = [];
  selectedEmployee: Employee | null = null;
  frequency: Frequency[] = [];
  selectedFrequency: Frequency | null = null;
  machineStatus: MachineStatus[] = [];
  selectedStatus: MachineStatus | null = null;
  isSuperAdmin: boolean | undefined;
  isAdmin: boolean | undefined;
  isManager: boolean | undefined;
  isSupervisor: boolean | undefined;

  machineStatusOptions: string[] = [
    'ใช้งานได้',
    'ไม่ได้ใช้งาน',
    'ซ่อมบำรุง'
  ];

  checkStatusOptions: string[] = [
    'รอดำเนินการ',
    'รอหัวหน้างานตรวจสอบ',
    'รอผู้จัดการฝ่ายตรวจสอบ',
    'ดำเนินการเสร็จสิ้น'
  ];
  
  constructor(
    private machineService: MachineService,
    private recordService: ChecklistRecordsService,
    private messageService: MessageService,
    private router: Router,
    private storageService: StorageService,
    private confirmationService: ConfirmationService,
  ) {
    this.items = [
        {
            label: 'Machines', command: () => { this.exportMachineToExcel(); }
        },
        {
            label: 'Checklists', command: () => { this.exportChecklistToExcel(); }
        }
    ];
  }

  ngOnInit(): void {
    this.isSuperAdmin = this.storageService.getRole() === 'SUPERADMIN';
    this.isAdmin = this.storageService.getRole() === 'ADMIN';
    this.isManager = this.storageService.getRole() === 'MANAGER';
    this.isSupervisor = this.storageService.getRole() === 'SUPERVISOR';
    
    if(this.isSuperAdmin) {
      this.loadMachines();
    } else if(this.isAdmin) {
      this.loadMachinesByDepartment();
    } else{
      this.loadMachinesByResponsibleAll();
    }

    this.loadData();
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
  }

  loadMachines(): void {
    this.loading = true;
    this.machineService.getMachines().subscribe({
      next: (data: Machine[]) => {
        this.machines = data;
        this.filteredMachines = [...this.machines]; 
        this.first = 0;
        this.loading = false;
      },
      error: (err: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load machines: ' + (err.message || 'Unknown error')
        });
        this.loading = false;
      }
    });
  }
  
  loadMachinesByDepartment(): void {
    this.loading = true;
    this.machineService.getMachinesByDepartment(this.storageService.getUsername()).subscribe({
      next: (data: Machine[]) => {
        this.machines = data;
        this.filteredMachines = [...this.machines]; 
        this.first = 0;
        this.loading = false;
      },
      error: (err: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load machines: ' + (err.message || 'Unknown error')
        });
        this.loading = false;
      }
    });
  }
  
  loadMachinesByResponsibleAll(): void {
    this.loading = true;
    this.machineService.getMachinesByResponsibleAll(this.storageService.getUsername()).subscribe({
      next: (data: Machine[]) => {
        this.machines = data;
        this.filteredMachines = [...this.machines]; 
        this.first = 0;
        this.loading = false;
      },
      error: (err: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load machines: ' + (err.message || 'Unknown error')
        });
        this.loading = false;
      }
    });
  }

  exportMachineToExcel(): void {
    this.machineService.exportMachinesToExcel().subscribe({
      next: (blob) => {
        saveAs(blob, 'machines-QRCode.xlsx');
      },
      error: (error) => {
        console.error('Error exporting to Excel:', error);
      }
    });
  }

  exportChecklistToExcel(): void {
    this.recordService.exportChecklistToExcel().subscribe({
      next: (blob) => {
        saveAs(blob, 'Checklist.xlsx');
      },
      error: (error) => {
        console.error('Error exporting to Excel:', error);
      }
    });
  }

  applyFilters(): void {
    let tempMachines = [...this.machines];

    if (this.searchQuery.trim()) {
      tempMachines = tempMachines.filter(machine =>
        machine.machineName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        machine.machineCode.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (machine.responsiblePersonName && machine.responsiblePersonName.toLowerCase().includes(this.searchQuery.toLowerCase()))
      );
    }

    if (this.selectedMachineStatus) {
      tempMachines = tempMachines.filter(machine => 
        machine.machineStatus === this.selectedMachineStatus
      );
    }

    if (this.selectedCheckStatus) {
      tempMachines = tempMachines.filter(machine => 
        machine.checkStatus === this.selectedCheckStatus
      );
    }

    this.filteredMachines = tempMachines;
    this.first = 0; 
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedMachineStatus = '';
    this.selectedCheckStatus = '';
    this.filteredMachines = [...this.machines];
    this.first = 0;
  }

  onPageChange(event: PaginatorState): void {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 5;
  }

  getRoleClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'รอดำเนินการ': return 'tag-danger';
      case 'รอหัวหน้างานตรวจสอบ': return 'tag-warn';
      case 'รอผู้จัดการฝ่ายตรวจสอบ': return 'tag-orange';
      case 'ดำเนินการเสร็จสิ้น': return 'tag-success';
      case 'ใช้งานได้': return 'tag-success';
      case 'ไม่ได้ใช้งาน': return 'tag-warn';
      case 'ซ่อมบำรุง': return 'tag-danger';
      default: return 'tag-secondary';
    }
  }

  onMachineDetail(machineId: number): void {
    this.router.navigate(['/machine-detail', machineId]);
  }

  kpiReport(): void {
    this.router.navigate(['/kpi-report']);
  }
  
  onUserList(): void {
    this.router.navigate(['/user-list']);
  }
  
  onAdd(): void {
    this.router.navigate(['/machine-add']);
  }
  
  onEdit(machineId: number): void {
    this.router.navigate(['/machine-edit', machineId]);
  }

  onDelete(machineId: number): void {
    this.confirmationService.confirm({
      message: 'คุณต้องการลบรายการนี้หรือไม่?',
      header: 'ยืนยันการลบ',
      rejectLabel: 'ยกเลิก',
      rejectButtonProps: {
        style: { 'font-size': '12px' },
        label: 'ยกเลิก',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        style: { 'font-size': '12px' },
        label: 'ลบ',
        severity: 'danger',
      },
      accept: () => {
        this.machineService.deleteMachine(machineId).subscribe({
          next: () => {
            this.machines = this.machines.filter(machine => machine.id !== machineId);
            this.filteredMachines = this.filteredMachines.filter(machine => machine.id !== machineId);
            this.first = 0;
            this.messageService.add({
              severity: 'info',
              summary: 'สำเร็จ',
              detail: 'ลบเครื่องจักรเรียบร้อยแล้ว'
            });
          },
          error: (err: any) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'ไม่สามารถลบเครื่องจักรได้: ' + (err.message || 'Unknown error')
            });
          }
        });
      },
      reject: () => {
        this.messageService.add({
          severity: 'warn',
          summary: 'ยกเลิก',
          detail: 'คุณได้ยกเลิกการลบ'
        });
      }
    });
  }

  export() {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Data Saved' });
  }
}