// src/app/services/machine.service.ts
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Machine, MachineResponse } from "../models/machine.model"; // อัปเดต import
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class MachineService {
  private baseUrl = '/api/machines'; 

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken(); 
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getAllMachines(): Observable<Machine[]> {
    return this.http.get<Machine[]>(this.baseUrl, { headers: this.getHeaders() });
  }

  getMachineWithQRCode(id: number): Observable<MachineResponse> {
    return this.http.get<MachineResponse>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
  }

  generateQRCode(qrContent: string): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/generate`, { content: qrContent });
  }

  getMachineByMachineCode(machineCode: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/machine-code/${machineCode}`, { headers: this.getHeaders() });
  }

  getMachinesByResponsiblePersonId(personId: string): Observable<Machine[]> {
    return this.http.get<Machine[]>(`${this.baseUrl}/responsible/${personId}`, { headers: this.getHeaders() });
  }

  getMachinesByResponsibleAll(personId: string): Observable<Machine[]> {
    return this.http.get<Machine[]>(`${this.baseUrl}/responsible-all/${personId}`, { headers: this.getHeaders() });
  }

  addMachine(machine: any): Observable<Machine> {
    return this.http.post<Machine>(this.baseUrl, machine, { headers: this.getHeaders() });
  }

  updateMachine(machine: Machine): Observable<Machine> {
    return this.http.put<Machine>(`${this.baseUrl}/${machine.id}`, machine, { headers: this.getHeaders() });
  }

  deleteMachine(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
  }

  uploadImage(selectedFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', selectedFile);
    const uploadHeaders = this.getHeaders().set('Content-Type', 'multipart/form-data');
    return this.http.post(`${this.baseUrl}/upload`, formData, { headers: uploadHeaders });
  }
}