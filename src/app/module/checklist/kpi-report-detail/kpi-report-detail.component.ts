import { Component, OnInit } from '@angular/core';
import { Record } from '../../../models/checklist-record.model';
import { ChecklistRecordsService } from '../../../services/checklist-records.service';
import { MessageService } from 'primeng/api';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-kpi-report-detail',
  standalone: false,
  templateUrl: './kpi-report-detail.component.html',
  styleUrls: ['./kpi-report-detail.component.scss']
})
export class KpiReportDetailComponent implements OnInit {

  loading: boolean = true;
  meterValue: any[] = [];
  records: Record[] = [];
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
  isSuperAdmin: boolean | undefined;
  isManager: boolean | undefined;
  isSupervisor: boolean | undefined;
  storageService: any;
  uid!: string;
  
  constructor(
    private messageService: MessageService,
    private recordService: ChecklistRecordsService, 
    private location: Location,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 5 }, (_, i) => ({
      name: (currentYear - i).toString(),
      value: (currentYear - i).toString()
    }));
    
    const userId = this.route.snapshot.paramMap.get('userId');
    if (!userId) {
      throw new Error('User ID is missing in route parameters');
    }
    this.uid = userId;
    this.loadChecklistRecords();
  }

  loadChecklistRecords(): void {
    this.loading = true;
    this.recordService.getRecordByPeriod(this.uid, this.selectedYear, this.selectedMonth).subscribe({
      next: (data: Record[]) => {
        this.records = data;
        this.loading = false;
      },
      error: (err: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'ข้อผิดพลาด',
          detail: 'ไม่สามารถโหลดข้อมูล KPI ได้: ' + (err.message || 'ข้อผิดพลาดที่ไม่ทราบสาเหตุ')
        });
        this.records = [];
        this.meterValue = [
          { label: 'คิดเป็นร้อยละ', value: 0, color: 'var(--p-primary-color)', max: 100 }
        ];
        this.loading = false;
      }
    });
  }

  onMonthChange(): void {
   this.loadChecklistRecords();
  }

  onYearChange(): void {
    this.loadChecklistRecords();
  }

  goBack(): void {
    this.location.back();
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

}
