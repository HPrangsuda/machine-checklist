// src/app/services/machine.service.ts
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, Observable, throwError } from "rxjs";
import { Machine, MachineResponse } from "../models/machine.model"; // อัปเดต import
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class MachineService {
  private baseUrl = '/api/machines'; 
  private fileUrl = '/api/file'; 

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(contentType: string = 'application/json'): HttpHeaders {
    const token = this.authService.getAccessToken();
  
    return new HttpHeaders({
      'Authorization': `Bearer ${token || ''}`,
      'Content-Type': contentType
    });
  }

  getMachines(): Observable<Machine[]> {
    return this.http.get<Machine[]>(this.baseUrl, { headers: this.getHeaders() });
  }

  getMachineImage(filename: any):any{
    return `${this.fileUrl}/${filename}`;
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

  getMachinesByDepartment(personId: string): Observable<Machine[]> {
    return this.http.get<Machine[]>(`${this.baseUrl}/department/${personId}`, { headers: this.getHeaders() });
  }

  getMachinesByResponsibleAll(personId: string): Observable<Machine[]> {
    return this.http.get<Machine[]>(`${this.baseUrl}/responsible-all/${personId}`, { headers: this.getHeaders() });
  }

  addMachine(machineData: any, file?: File): Observable<Machine> {
    const formData = new FormData();
    
    formData.append('machine', new Blob([JSON.stringify(machineData)], {
      type: 'application/json'
    }));
    
    if (file) {
      formData.append('file', file);
    }
    
    return this.http.post<Machine>(`${this.baseUrl}/create`, formData);
  }

  updateMachine(id: number, machineData: any): Observable<MachineResponse> {
    return this.http.put<MachineResponse>(`${this.baseUrl}/update/${id}`, machineData, { headers: this.getHeaders() });
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

  exportMachinesToExcel(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/export-excel`, {
      responseType: 'blob'
    });
  }
}