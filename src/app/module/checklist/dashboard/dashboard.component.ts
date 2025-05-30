import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Machine } from '../../../models/machine.model';
import { MachineService } from '../../../services/machine.service';
import { MessageService } from 'primeng/api';
import { StorageService } from '../../../core/service/storage.service';
import { Kpi } from '../../../models/kpi.model';
import { KpiService } from '../../../services/kpi.service';
import { PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  machines: Machine[] = [];
  filteredMachines: Machine[] = [];
  loading: boolean = true;
  searchQuery: string = '';
  totalCount: number = 0;
  completedCount: number = 0;
  pendingCount: number = 0;
  meterValue: any[] = [];
  record: Kpi | null = null;
  months: { name: string, value: number }[] = [
    { name: 'มกราคม', value: 1 },
    { name: 'กุมภาพันธ์', value: 2 },
    { name: 'มีนาคม', value: 3 },
    { name: 'เมษายน', value: 4 },
    { name: 'พฤษภาคม', value: 5 },
    { name: 'มิถุนายน', value: 6 },
    { name: 'กรกฎาคม', value: 7 },
    { name: 'สิงหาคม', value: 8 },
    { name: 'กันยายน', value: 9 },
    { name: 'ตุลาคม', value: 10 },
    { name: 'พฤศจิกายน', value: 11 },
    { name: 'ธันวาคม', value: 12 }
  ];
  years: { name: string, value: string }[] = [];
  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: string = new Date().getFullYear().toString();
  
  first: number = 0;
  rows: number = 10;

  constructor(
    private machineService: MachineService,
    private messageService: MessageService,
    private router: Router,
    private storageService: StorageService,
    private kpiService: KpiService
  ) {}

  ngOnInit(): void {
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 5 }, (_, i) => ({
      name: (currentYear - i).toString(),
      value: (currentYear - i).toString()
    }));
    
    this.loadMachinesByResponsiblePerson();
    this.loadKpi();
  }

  loadMachinesByResponsiblePerson(): void {
    this.loading = true;
    this.machineService.getMachinesByResponsiblePersonId(this.storageService.getUsername()).subscribe({
      next: (data: Machine[]) => {
        // เรียงลำดับตาม id DESC
        this.machines = data.sort((a, b) => (b.id || 0) - (a.id || 0));
        this.filteredMachines = [...this.machines];
        this.totalCount = this.machines.length;
        this.completedCount = this.machines.filter(machine => machine.checkStatus === 'ดำเนินการเสร็จสิ้น').length;
        this.pendingCount = this.machines.filter(machine => machine.checkStatus === 'รอดำเนินการ').length;
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

  loadKpi(): void {
    this.loading = true;
    this.kpiService.getKpi(this.storageService.getUsername(), this.selectedYear, this.selectedMonth).subscribe({
      next: (data: Kpi) => {
        this.record = data;
        this.meterValue = [
          {
            label: 'คิดเป็นร้อยละ',
            value: data.checkAll && data.checkAll > 0 ? (data.checked / data.checkAll) * 100 : 0,
            color: 'var(--p-primary-color)',
            max: 100
          }
        ];
        this.loading = false;
      },
      error: (err: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'ข้อผิดพลาด',
          detail: 'ไม่สามารถโหลดข้อมูล KPI ได้: ' + (err.message || 'ข้อผิดพลาดที่ไม่ทราบสาเหตุ')
        });
        this.record = null;
        this.meterValue = [
          { label: 'คิดเป็นร้อยละ', value: 0, color: 'var(--p-primary-color)', max: 100 }
        ];
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

    this.filteredMachines = tempMachines;
    this.totalCount = this.filteredMachines.length;
    this.completedCount = this.filteredMachines.filter(machine => machine.checkStatus === 'ดำเนินการเสร็จสิ้น').length;
    this.pendingCount = this.filteredMachines.filter(machine => machine.checkStatus === 'รอดำเนินการ').length;
    this.first = 0; 
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.filteredMachines = [...this.machines];
    this.totalCount = this.machines.length;
    this.completedCount = this.machines.filter(machine => machine.checkStatus === 'ดำเนินการเสร็จสิ้น').length;
    this.pendingCount = this.machines.filter(machine => machine.checkStatus === 'รอดำเนินการ').length;
    this.first = 0;
  }

  onPageChange(event: PaginatorState): void {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 10;
  }

  onMonthChange(): void {
    this.loadKpi();
  }

  onYearChange(): void {
    this.loadKpi();
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