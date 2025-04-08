import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class NotifyService {

constructor(private messageService: MessageService) { }

msgWarn(title: any, detailes: any) {
  this.messageService.add({ severity: 'warn', summary: title, detail: detailes });
}

msgError(title: any, detailes: any) {
  this.messageService.add({ severity: 'error', summary: title, detail: detailes });
}

msgSuccess(title: any, detailes: any) {
  this.messageService.add({ severity: 'success', summary: title, detail: detailes });
}

msgInfo(title: any, detailes: any) {
  this.messageService.add({ severity: 'info', summary: title, detail: detailes });
}

}
