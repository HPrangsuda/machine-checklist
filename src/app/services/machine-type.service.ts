import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { MachineType } from '../models/machine-type.model';

@Injectable({
  providedIn: 'root'
})
export class MachineTypeService {
  private baseUrl = '/api/type'; // ใช้ proxy แทนการระบุ URL เต็ม

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken(); // เปลี่ยนจาก getToken เป็น getAccessToken
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getAllMachinesType(): Observable<MachineType[]> {
    return this.http.get<MachineType[]>(this.baseUrl, { headers: this.getHeaders() });
  }
}