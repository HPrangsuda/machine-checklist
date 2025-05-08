import { Component, OnDestroy } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ChecklistRecordsService } from '../../../services/checklist-records.service';
import { Record } from '../../../models/checklist-record.model';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';

interface ChecklistItem {
  questionDetail: string;
  answerChoice: string;
}

@Component({
  selector: 'app-checklist-detail',
  standalone: false,
  templateUrl: './checklist-detail.component.html',
  styleUrls: ['./checklist-detail.component.scss']
})
export class ChecklistDetailComponent implements OnDestroy {
  record: Record | null = null;
  checklistItems: ChecklistItem[] = []; // เพิ่มสำหรับตาราง
  loading: boolean = true;
  error: string | null = null;
  machineImage:string = "assets/images/default-machine.jpg";
  private subscription?: Subscription;

  constructor(
    private recordService: ChecklistRecordsService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.loading = true;
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!isNaN(id)) {
      this.subscription = this.recordService.getRecordById(id).subscribe({
        next: (data: Record) => {
          this.record = data;
          
          if(this.record.machineImage){
            this.machineImage =  this.recordService.getMachineImage(this.record.machineImage);
          }
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