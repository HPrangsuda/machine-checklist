import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService } from '../service/storage.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private storageService: StorageService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // ดึง access token จาก StorageService
    const accessToken = this.storageService.getAccessToken();

    // ถ้ามี token และ request ไม่ใช่บาง URL ที่ไม่ต้องการ token (เช่น login)
    if (accessToken) {
      // clone request และเพิ่ม header Authorization
      const authRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return next.handle(authRequest);
    }

    // ถ้าไม่มี token ส่ง request เดิมไปเลย
    return next.handle(request);
  }
}