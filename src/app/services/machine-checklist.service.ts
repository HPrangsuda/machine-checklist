import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MachineChecklistService {
  private baseUrl = '/api/checklist'; 
    
  constructor(private http: HttpClient  ) {}

  getMachineByMachineCode(code: string): Observable<any> {
    const params = new HttpParams().set('machineCode', code);
    console.log(params);
    return this.http.get<any>(`${this.baseUrl}/machine`, { params });
  }

  getChecklistGeneral(code: string): Observable<any> {
    const params = new HttpParams().set('machineCode', code);
    console.log(params);
    return this.http.get<any>(`${this.baseUrl}/machine/general`, { params });
  }
}