import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Record } from "../models/checklist-record.model";
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class ChecklistRecordsService {
    uploadFile(file: File) {
        throw new Error('Method not implemented.');
    }
    
    private baseUrl = '/api/checklist-records'; 
    private fileUrl = '/api/file'; 
    
    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) {}

    private getHeaders(): HttpHeaders {
        const token = this.authService.getAccessToken(); 
        return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }

    getMachineImage(filename: any):any{
        return `${this.fileUrl}/${filename}`;
      }
      
    getAllRecords(): Observable<Record[]> {
        return this.http.get<Record[]>(`${this.baseUrl}`, { headers: this.getHeaders() });
    }

    getRecordById(checklistId: number): Observable<Record> {
        const params = new HttpParams().set('id', checklistId.toString());
        return this.http.get<Record>(`${this.baseUrl}/record`, { params, headers: this.getHeaders() });
    }

    getRecordByResponsiblePerson(personId: string): Observable<Record[]> {
        return this.http.get<Record[]>(`${this.baseUrl}/responsible/${personId}`);
    }

    getRecheck(personId: string): Observable<Record[]> {
        return this.http.get<Record[]>(`${this.baseUrl}/recheck/${personId}`);
    }
    
    getRecheckByResponsiblePersonId(personId: string): Observable<Record[]> {
        return this.http.get<Record[]>(`${this.baseUrl}/responsible/${personId}`, { headers: this.getHeaders() });
    }
        
    saveChecklistRecord(record: any): Observable<any> {
        return this.http.post(this.baseUrl, record);
    }

    saveRecheck(checklistId: number, payload: any): Observable<any> {
        return this.http.put(`${this.baseUrl}/approve/${checklistId}`, payload);
    }
}