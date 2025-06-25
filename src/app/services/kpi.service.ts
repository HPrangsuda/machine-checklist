import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Kpi } from '../models/kpi.model';

@Injectable({
  providedIn: 'root'
})
export class KpiService {
  private baseUrl = '/api/kpi'; 

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token || ''}`);
  }

  getKpiAll(year: string, month: number): Observable<Kpi[]> {
    const formattedMonth = month.toString().padStart(2, '0');
    return this.http.get<Kpi[]>(`${this.baseUrl}?year=${year}&month=${formattedMonth}`, { headers: this.getHeaders() });
  }

  getKpiResponsible(employeeId: string, year: string, month: number): Observable<Kpi[]> {
    const formattedMonth = month.toString().padStart(2, '0');
    return this.http.get<Kpi[]>(`${this.baseUrl}/responsible/${employeeId}?year=${year}&month=${formattedMonth}`, { headers: this.getHeaders() });
  }
  
  getKpi(employeeId: string, year: string, month: number): Observable<Kpi> {
    const formattedMonth = month.toString().padStart(2, '0'); 
    return this.http.get<Kpi>(`${this.baseUrl}/${employeeId}?year=${year}&month=${formattedMonth}`, { headers: this.getHeaders() });
  }
}