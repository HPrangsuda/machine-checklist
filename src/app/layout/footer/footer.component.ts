import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BarcodeFormat } from '@zxing/library';
import { ZXingScannerComponent } from '@zxing/ngx-scanner';
import { NotifyService } from '../../core/service/notify.service';

@Component({
  selector: 'app-footer',
  standalone: false,
  templateUrl: './footer.component.html'
})
export class FooterComponent {
  @ViewChild(ZXingScannerComponent) scanner!: ZXingScannerComponent;
  mappedData: { status?: string; code?: string } | null = null;
  scanResult: string | null = null;
  isScannerVisible = false;
  isScannerEnabled = false;
  allowedFormats = [
    BarcodeFormat.QR_CODE,
    BarcodeFormat.EAN_13,
    BarcodeFormat.CODE_128,
    BarcodeFormat.DATA_MATRIX,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E,
    BarcodeFormat.EAN_8,
    BarcodeFormat.CODE_39,
    BarcodeFormat.CODE_93,
    BarcodeFormat.CODABAR,
    BarcodeFormat.ITF,
    BarcodeFormat.PDF_417,
    BarcodeFormat.AZTEC,
  ];

  constructor(private router: Router, private notify: NotifyService) {
   
  }

  onHome() {
    this.router.navigate(['/dashboard']);
  }
  
  onRecheck() {
    this.router.navigate(['/recheck']);
  }

  onChecklist() {
    this.isScannerVisible = true;
    this.scanResult = null;
    this.isScannerEnabled = true;
  }

  onSetting() {
    this.router.navigate(['/machine-list']);
  }

  onHistory() {
    this.router.navigate(['/history']);
  }

  onScanSuccess(result: string) {
    this.scanResult = result;
    try {
      const jsonData = JSON.parse(result);
       this.mappedData = {
        status: jsonData.status || 'N/A',
        code: jsonData.code || 'N/A',
      };
      if( this.mappedData.status){
        this.router.navigate(['/checklist/', this.mappedData.code]);
        this.isScannerEnabled = false; 
        this.isScannerVisible = false;
        this.notify.msgSuccess("QR Code Scan","Machine qr code scan successfull");
      }
    } catch (error) {
      this.notify.msgError("QR Code Scan error","Machine qr scan exception");
    }
  }

  stopScanner() {
    this.isScannerEnabled = false; // ปิดการสแกน
    if (this.scanner) {
      this.scanner.reset(); // รีเซ็ตสถานะ scanner
    }
    this.isScannerVisible = false; // ปิด dialog
  }

  onDeviceSelect(event: any) {
    console.log('Selected device:', event);
  }

  onScanError(error: any) {
    console.error('Scan error:', error);
  }
}
