import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ChecklistRecordsService } from '../../../services/checklist-records.service';
import { Record } from '../../../models/checklist-record.model';
import { StorageService } from '../../../core/service/storage.service';

@Component({
  selector: 'app-history',
  standalone: false,
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent {
  records: Record[] = [];
  filteredRecords: Record[] = []; 
  loading: boolean = true;
  searchQuery: string = '';
  authService: any;

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
    this.recordService.getRecordByResponsiblePerson(this.storageService.getUsername()).subscribe({
      next: (data: Record[]) => {
        this.records = data;
        this.filteredRecords = [...this.records];
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
        record.userName.toLocaleLowerCase().includes(this.searchQuery.toLowerCase()) ||
        record.dateCreated.toLocaleLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    this.filteredRecords = tempRecords;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.filteredRecords = [...this.records];
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
    this.router.navigate(['/checklist-detail', id]);
  }
}
