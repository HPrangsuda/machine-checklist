import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from './storage.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    getAccessToken(): any {
      throw new Error('Method not implemented.');
    }
    returnUrl?: any;
    getToken: any;

    constructor(
        private http: HttpClient, 
        private storageService: StorageService, 
        private router: ActivatedRoute,
        private route: Router) { }

    isAuthenticated(): boolean{
        if (this.storageService.checkAccessKey()) {
            return true;
        } else {
            return false;
        }
    }

    refreshToken(): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Session-Refresh': `${this.storageService.getRefreshToken()}`
        });
        const data = {
            refreshToken: this.storageService.getRefreshToken()
        }
        return this.http.post(`api/auth/refresh`, data, { headers }).pipe(
            tap((response: any) => {
                if(!response.success){
                    this.returnUrl = this.router.snapshot.queryParams['returnUrl'] || '/central';
                    this.route.navigateByUrl(decodeURIComponent(this.returnUrl));
                    this.logout();
                }
            })
        );
    }
    
    logout() {
        const data = {
            refreshToken: this.storageService.getRefreshToken()
        }
        return this.http.post<any>(`/api/auth/logout`, data).pipe(
            tap((response: any) => {
                this.storageService.clear();
            })
        );
    }
}