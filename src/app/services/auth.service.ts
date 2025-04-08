import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface LoginResponse {
  code: number;
  accessToken: string;
  refreshToken: string;
  username: string;
  userFullname: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = '/api/auth'; 

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, { username, password }).pipe(
      tap((response) => {
        if (response.code === 200 && response.accessToken) {
          this.setSession(response);
        }
      })
    );
  }

  setSession(response: LoginResponse): void {
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken); 
    localStorage.setItem('username', response.username);
    localStorage.setItem('userFullname', response.userFullname);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken'); 
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  getUserFullname(): string | null {
    const firstname = localStorage.getItem('firstname');
    const lastname = localStorage.getItem('lastname');
    return firstname && lastname ? `${firstname} ${lastname}` : null;
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
  }

  refreshToken(): Observable<LoginResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    return this.http.post<LoginResponse>(`${this.baseUrl}/refresh`, { refreshToken }).pipe(
      tap((response: LoginResponse) => {
        if (response.code === 200 && response.accessToken) {
          this.setSession(response);
        }
      })
    );
  }
}