import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Machine } from '../../../models/machine.model';
import { MachineService } from '../../../services/machine.service';
import { MessageService } from 'primeng/api';
import { StorageService } from '../../../core/service/storage.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  machines: Machine[] = [];
  loading: boolean = true;
  totalCount: number = 0;
  completedCount: number = 0;
  pendingCount: number = 0;

  constructor(
    private machineService: MachineService,
    private messageService: MessageService,
    private router: Router,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    console.log(this.storageService.getUsername());
    this.loadMachinesByResponsiblePerson();
  }

  loadMachinesByResponsiblePerson(): void {
    this.loading = true;
    this.machineService.getMachinesByResponsiblePersonId(this.storageService.getUsername()).subscribe({
      next: (data: Machine[]) => {
        this.machines = data;
        this.loading = false;
        this.totalCount = this.machines.length;
        this.completedCount = this.machines.filter(machine => machine.checkStatus === 'ดำเนินการเสร็จสิ้น').length;
        this.pendingCount = this.machines.filter(machine => machine.checkStatus === 'รอดำเนินการ').length;
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

  onMachineResponsible(): void {
    this.router.navigate(['/machine-responsible']);
  }

  onMachineDetail(machineId: number): void {
    this.router.navigate(['/machine-detail', machineId]);
  }
}