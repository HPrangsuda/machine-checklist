import { Component, OnDestroy } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ChecklistRecordsService } from '../../../services/checklist-records.service';
import { Record } from '../../../models/checklist-record.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { NotifyService } from '../../../core/service/notify.service';

interface ChecklistItem {
  questionDetail: string;
  answerChoice: string;
}

@Component({
  selector: 'app-recheck-detail',
  standalone: false,
  templateUrl: './recheck-detail.component.html',
  styleUrl: './recheck-detail.component.scss'
})
export class RecheckDetailComponent {
  record: Record | null = null;
  checklistItems: ChecklistItem[] = []; 
  loading: boolean = true;
  error: string | null = null;
  private subscription?: Subscription;

  constructor(
    private recordService: ChecklistRecordsService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private http: HttpClient,
    private notifyService: NotifyService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!isNaN(id)) {
      this.subscription = this.recordService.getRecordById(id).subscribe({
        next: (data: Record) => {
          this.record = data;
          this.parseChecklist(data.machineChecklist); 
          this.loading = false;
        },
        error: (err) => {
          this.error = 'ไม่สามารถโหลดข้อมูลเครื่องจักรได้';
          this.loading = false;
          console.error('ข้อผิดพลาด:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'ข้อผิดพลาด',
            detail: 'ไม่สามารถโหลดข้อมูลเครื่องจักรได้'
          });
        }
      });
    } else {
      this.error = 'รหัสไม่ถูกต้อง';
      this.loading = false;
      this.messageService.add({
        severity: 'error',
        summary: 'ข้อผิดพลาด',
        detail: 'รหัสเครื่องจักรไม่ถูกต้อง'
      });
    }
  }

  private parseChecklist(checklist: string | undefined | null): void {
    this.checklistItems = []; // รีเซ็ต checklistItems ก่อน
    if (!checklist) {
      console.warn('machineChecklist is undefined or null');
      this.messageService.add({
        severity: 'warn',
        summary: 'คำเตือน',
        detail: 'ไม่มีข้อมูลรายการตรวจสอบ'
      });
      return;
    }

    try {
      this.checklistItems = JSON.parse(checklist) as ChecklistItem[];
    } catch (e) {
      console.error('Error parsing machineChecklist:', e);
      this.checklistItems = [];
      this.messageService.add({
        severity: 'error',
        summary: 'ข้อผิดพลาด',
        detail: 'ไม่สามารถแสดงรายการตรวจสอบได้ เนื่องจากข้อมูลไม่ถูกต้อง'
      });
    }
  }

  approveChecklist(checklistId: number) {
    this.http.put(`/api/checklist-records/approve/${checklistId}`, {})
      .subscribe({
        next: (response: any) => {
          console.log('Checklist approved:', response);
          this.router.navigate(['/recheck']);
          this.notifyService.msgSuccess("Approve","success approve");
        },
        error: (error: any) => {
          this.notifyService.msgError("Approve","approve failed");
        }
      });
  }
  
  getRoleClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'ไม่พร้อมใช้งาน (ปรับเปลี่ยนอุปกรณ์)': return 'tag-warn';
      case 'ไม่พร้อมใช้งาน (รอซ่อม)': return 'tag-danger';
      case 'ไม่พร้อมใช้งาน (ซ่อม)': return 'tag-danger';
      case 'พร้อมใช้งาน': return 'tag-success';
      case 'อื่นๆ': return 'tag-secondary';
      case 'ใช้งานได้': return 'tag-success';
      case 'ไม่ได้ใช้งาน': return 'tag-warn';
      case 'ซ่อมบำรุง': return 'tag-danger';
      default: return 'tag-secondary';
    }
  }

  goBack(): void {
    this.location.back();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
