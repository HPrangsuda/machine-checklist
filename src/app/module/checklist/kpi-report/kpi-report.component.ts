import { Component, OnInit } from '@angular/core';
import { Kpi } from '../../../models/kpi.model';
import { StorageService } from '../../../core/service/storage.service';
import { KpiService } from '../../../services/kpi.service';
import { MessageService } from 'primeng/api';
import { Location } from '@angular/common';

@Component({
  selector: 'app-kpi-report',
  standalone: false,
  templateUrl: './kpi-report.component.html',
  styleUrls: ['./kpi-report.component.scss']
})
export class KpiReportComponent implements OnInit {
  loading: boolean = true;
  meterValue: any[] = [];
  records: Kpi[] = [];
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

  constructor(
    private messageService: MessageService,
    private storageService: StorageService,
    private kpiService: KpiService,
    private location: Location,
  ) { }

  ngOnInit() {
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 5 }, (_, i) => ({
      name: (currentYear - i).toString(),
      value: (currentYear - i).toString()
    }));
    
    this.loadKpi();
  }

  loadKpi(): void {
    this.loading = true;
    this.kpiService.getKpiAll(this.selectedYear, this.selectedMonth).subscribe({
      next: (data: Kpi[]) => {
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
    this.loadKpi();
  }

  onYearChange(): void {
    this.loadKpi();
  }

  goBack(): void {
    this.location.back();
  }
}
