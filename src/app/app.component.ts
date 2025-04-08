import { Component } from '@angular/core';
import { BarcodeFormat } from '@zxing/library';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
})
export class AppComponent {
  title = 'machine-checklist';
  allowedFormats = [ BarcodeFormat.QR_CODE];

}
