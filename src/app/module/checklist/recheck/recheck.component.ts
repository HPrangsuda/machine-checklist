import { Component} from '@angular/core';
import { Record } from '../../../models/checklist-record.model';
import { ChecklistRecordsService } from '../../../services/checklist-records.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { StorageService } from '../../../core/service/storage.service';
import { PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-recheck',
  standalone: false,
  templateUrl: './recheck.component.html',
  styleUrl: './recheck.component.scss'
})
export class RecheckComponent {records: Record[] = [];
  filteredRecords: Record[] = []; 
  paginatedRecords: Record[] = [];
  loading: boolean = true;
  searchQuery: string = '';
  authService: any;

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
        this.records = data;
        this.filteredRecords = [...this.records]; 
        this.paginate();
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
    this.first = 0;
    this.paginate();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.filteredRecords = [...this.records];
    this.first = 0;
    this.paginate();
  }

  paginate(): void {
    const end = this.first + this.rows;
    this.paginatedRecords= this.filteredRecords.slice(this.first, end);
  }

  onPageChange(event: PaginatorState): void {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 5; 
    this.paginate();
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
