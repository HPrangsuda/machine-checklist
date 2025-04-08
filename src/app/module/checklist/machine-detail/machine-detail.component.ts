import { Component, } from '@angular/core';
import { MachineResponse } from '../../../models/machine.model';
import { MachineService } from '../../../services/machine.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-machine-detail',
  standalone: false,
  templateUrl: './machine-detail.component.html',
  styleUrls: ['./machine-detail.component.scss']
})
export class MachineDetailComponent {
  machineResponse: MachineResponse | null = null;
  qrCodeImage: string | null = null;
  error: string | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private machineService: MachineService,
    private location: Location
  ) {}
  
  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!isNaN(id)) {
      this.machineService.getMachineWithQRCode(id).subscribe({
        next: (response: MachineResponse) => {
          this.machineResponse = response;
          this.qrCodeImage = 'data:image/png;base64,' + response.qrCodeImage;
        },
        error: (err) => {
          this.error = 'Failed to load machine details';
          console.error('Error:', err);
        }
      });
    }
  }

  downloadQRCode(): void {
    if (this.qrCodeImage) {
      const link = document.createElement('a');
      link.href = this.qrCodeImage; // ใช้ Base64 data URL โดยตรง
      link.download = `QRCode_${this.machineResponse?.machine?.machineCode || 'machine'}.png`; // ตั้งชื่อไฟล์
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      this.error = 'No QR code available to download';
    }
  }

  goBack(): void {
    this.location.back();
  }
}
