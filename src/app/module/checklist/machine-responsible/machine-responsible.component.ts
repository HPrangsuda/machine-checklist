import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Machine } from '../../../models/machine.model';
import { MachineService } from '../../../services/machine.service';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../services/auth.service';
import { StorageService } from '../../../core/service/storage.service';

@Component({
  selector: 'app-machine-responsible',
  standalone: false,
  templateUrl: './machine-responsible.component.html',
  styleUrls: ['./machine-responsible.component.scss']
})
export class MachineResponsibleComponent implements OnInit {
  machines: Machine[] = [];
  filteredMachines: Machine[] = [];
  loading: boolean = true;
  searchQuery: string = '';
  selectedMachineStatus: string = '';
  selectedCheckStatus: string = '';
  
  rowsPerPageOptions: number[] = [1, 10, 20];
  rows: number = 10;
  totalRecords: number = 0;

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
    private messageService: MessageService,
    private router: Router,
    private location: Location,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.loadMachinesByResponsiblePerson();
  }

  loadMachinesByResponsiblePerson(): void {
    this.loading = true;
    this.machineService.getMachinesByResponsiblePersonId(this.storageService.getUsername()).subscribe({
      next: (data: Machine[]) => {
        this.machines = data;
        this.filteredMachines = [...data];
        this.totalRecords = data.length;
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
        machine.machineCode.toLowerCase().includes(this.searchQuery.toLowerCase())
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
    this.totalRecords = tempMachines.length;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedMachineStatus = '';
    this.selectedCheckStatus = '';
    this.filteredMachines = [...this.machines];
    this.totalRecords = this.machines.length;
  }

  onMachineDetail(machineId: number): void {
    this.router.navigate(['/machine-detail', machineId]);
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

  goBack(): void {
    this.location.back();
  }

  onPageChange(event: any): void {
    this.rows = event.rows;
    this.applyFilters();
  }
}