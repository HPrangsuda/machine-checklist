import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Machine } from '../../../models/machine.model';
import { MachineService } from '../../../services/machine.service';
import { MachineType } from '../../../models/machine-type.model';
import { MachineTypeService } from '../../../services/machine-type.service';
import { AuthService } from '../../../services/auth.service';
import { StorageService } from '../../../core/service/storage.service';

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
  machines: Machine[] = [];
  filteredMachines: Machine[] = [];
  loading: boolean = true;
  searchQuery: string = '';
  selectedMachineStatus: string = '';
  selectedCheckStatus: string = '';

  displayAddDialog: boolean = false;
  displayEditDialog: boolean = false;
  employee: Employee[] = [];
  selectedEmployee: Employee | null = null;
  frequency: Frequency[] = [];
  selectedFrequency: Frequency | null = null;
  machineStatus: MachineStatus[] = [];
  selectedStatus: MachineStatus | null = null;
  selectedType: MachineType | null = null;
  type: MachineType[] = [];

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
    private machineTypeService: MachineTypeService,
    private messageService: MessageService,
    private router: Router,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.loadMachinesByResponsibleAll();
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

    this.machineTypeService.getAllMachinesType().subscribe({
      next: (data: MachineType[]) => {
        this.type = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching machine types:', err);
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
        this.applyFilters();  
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
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedMachineStatus = '';
    this.selectedCheckStatus = '';
    this.filteredMachines = [...this.machines];
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

  onAdd(): void {
    this.router.navigate(['/machine-add']);
  }
  
  onEdit(machineId: number): void {
    this.router.navigate(['/machine-edit', machineId]);
  }
}