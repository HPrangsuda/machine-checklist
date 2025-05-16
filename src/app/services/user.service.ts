import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
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

    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(this.baseUrl, { headers: this.getHeaders() });
    }

    getUserById(id: number): Observable<User> {
        return this.http.get<User>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
    }
      
    addUser(user: User): Observable<User> {
        return this.http.post<User>(`${this.baseUrl}`, user, { headers: this.getHeaders() });
    }

    updateUser(id: number, user: any): Observable<User> {
        return this.http.put<User>(`${this.baseUrl}/update/${id}`, user, { headers: this.getHeaders() });
    }
    
    deleteUser(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
    }

    checkUsernameExists(username: string): Observable<boolean> {
        return this.http.get<boolean>(`${this.baseUrl}/check-username/${username}`, { 
            headers: this.getHeaders() 
        }).pipe(
            catchError(error => {
                console.error('Error checking username:', error);
                return of(false);
            })
        );
    }
}