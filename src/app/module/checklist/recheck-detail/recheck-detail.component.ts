import { Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ChecklistRecordsService } from '../../../services/checklist-records.service';
import { Record } from '../../../models/checklist-record.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotifyService } from '../../../core/service/notify.service';

interface ChecklistItem {
  questionDetail: string;
  answerChoice: string;
}

interface Reason {
  name: string;
}

@Component({
  selector: 'app-recheck-detail',
  standalone: false,
  templateUrl: './recheck-detail.component.html',
  styleUrl: './recheck-detail.component.scss'
})
export class RecheckDetailComponent implements OnInit, OnDestroy {
  record: Record | null = null;
  checklistItems: ChecklistItem[] = []; 
  loading: boolean = true;
  error: string | null = null;
  private subscription?: Subscription;
  machineImage: string = "assets/images/default-machine.jpg";
  Reason: Reason[] = [
    { name: 'ลางาน' },
    { name: 'เข้ากะ' },
    { name: 'ทำงานนอกสถานที่' },
    { name: 'อยู่ระหว่างซ่อมบำรุง' },
    { name: 'เครื่องมือใช้งานนอกสถานที่' },
    { name: 'ผู้รับผิดชอบไม่ดำเนินการ' }
  ];
  selectedReason: string | null = null;
  submitted: boolean = false;

  constructor(
    private recordService: ChecklistRecordsService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private notifyService: NotifyService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (isNaN(id)) {
      this.handleError('รหัสเครื่องจักรไม่ถูกต้อง');
      return;
    }

    this.subscription = this.recordService.getRecordById(id).subscribe({
      next: (data: Record) => {
        this.record = data;
        this.machineImage = data.machineImage 
          ? this.recordService.getMachineImage(data.machineImage) 
          : this.machineImage;
        
        this.parseChecklist(data.machineChecklist);

        if (data.reasonNotChecked && data.reasonNotChecked !== '') {
          this.selectedReason = this.Reason.find(r => r.name === data.reasonNotChecked.trim())?.name || null;
        }

        this.loading = false;
      },
      error: (err) => {
        this.handleError('ไม่สามารถโหลดข้อมูลเครื่องจักรได้', err);
      }
    });
  }

  private parseChecklist(checklist: string | undefined | null): void {
    this.checklistItems = [];
    if (!checklist) {
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
      this.messageService.add({
        severity: 'error',
        summary: 'ข้อผิดพลาด',
        detail: 'ไม่สามารถแสดงรายการตรวจสอบได้ เนื่องจากข้อมูลไม่ถูกต้อง'
      });
    }
  }

  approveChecklist(checklistId: number) {
    this.submitted = true;

    if (this.record?.reasonNotChecked && !this.selectedReason) {
      this.notifyService.msgWarn('ข้อมูลไม่ครบถ้วน', 'กรุณาเลือกเหตุผลที่ไม่สามารถตรวจสอบได้');
      return;
    }

    const payload = this.selectedReason ? { reasonNotChecked: this.selectedReason } : {};
    
    this.recordService.saveRecheck(checklistId, payload).subscribe({
      next: (response: any) => {
        this.notifyService.msgSuccess("สำเร็จ", "รายการตรวจสอบได้รับการอนุมัติเรียบร้อยแล้ว");
        this.router.navigate(['/recheck']);
      },
      error: (error: any) => {
        this.notifyService.msgError("เกิดข้อผิดพลาด", error.error?.message || "ไม่สามารถอนุมัติรายการตรวจสอบได้ กรุณาติดต่อผู้ดูแลระบบ");
      }
    });
  }

  onReasonChange(event: any) {
    this.selectedReason = event;
    console.log('Reason changed:', this.selectedReason);
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

  private handleError(message: string, err?: any): void {
    this.error = message;
    this.loading = false;
    console.error('ข้อผิดพลาด:', err);
    this.messageService.add({
      severity: 'error',
      summary: 'ข้อผิดพลาด',
      detail: message
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}