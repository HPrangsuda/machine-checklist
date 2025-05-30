import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ChecklistRecordsService } from '../../../services/checklist-records.service';
import { Record } from '../../../models/checklist-record.model';
import { StorageService } from '../../../core/service/storage.service';
import { PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-recheck',
  standalone: false,
  templateUrl: './recheck.component.html',
  styleUrl: './recheck.component.scss'
})
export class RecheckComponent {
  records: Record[] = [];
  filteredRecords: Record[] = [];
  loading: boolean = true;
  searchQuery: string = '';

  first: number = 0;
  rows: number = 5;

  constructor(
    private recordService: ChecklistRecordsService,
    private messageService: MessageService,
    private router: Router,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.loadRecordByResponsiblePerson();
  }

  loadRecordByResponsiblePerson(): void {
    this.loading = true;
    this.recordService.getRecheck(this.storageService.getUsername()).subscribe({
      next: (data: Record[]) => {
        // เรียงลำดับตาม checklistId DESC
        this.records = data.sort((a, b) => (b.checklistId || 0) - (a.checklistId || 0));
        this.filteredRecords = [...this.records];
        this.first = 0;
        this.loading = false;
      },
      error: (err: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load records: ' + (err.message || 'Unknown error')
        });
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let tempRecords = [...this.records];

    if (this.searchQuery.trim()) {
      tempRecords = tempRecords.filter(record =>
        record.machineName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        record.machineCode.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (record.userName && record.userName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (record.dateCreated && new Date(record.dateCreated).toLocaleString('th-TH', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).includes(this.searchQuery.toLowerCase()))
      );
    }

    this.filteredRecords = tempRecords;
    this.first = 0; // รีเซ็ตหน้าเมื่อมีการกรอง
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.filteredRecords = [...this.records];
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

  onRecord(id: number): void {
    this.router.navigate(['/recheck-detail', id]);
  }
}