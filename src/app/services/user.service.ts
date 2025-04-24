import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model'; 
import { AuthService } from './auth.service';
@Injectable({
  providedIn: 'root'
})
export class UserService {
    private baseUrl = '/api/user'; 

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) {}

    private getHeaders(): HttpHeaders {
        const token = this.authService.getAccessToken(); 
        return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }

    createUser(user: User): Observable<User> {
        return this.http.post<User>(`${this.baseUrl}/create`, user, { headers: this.getHeaders() });
    }
}