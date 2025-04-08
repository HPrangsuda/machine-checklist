import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    constructor(private cookieService: CookieService) {}
    encryptData(message: string): any {
        return btoa(message);
    }
    decryptData(message: any): any {
        return atob(message);
    }
    set(key: string, value: any) {
        localStorage.setItem(key, value);
    }
    get(key: string) {
        return localStorage.getItem(key);
    }
    setItem(key: string, value: any): any {
        return this.cookieService.set(key, value);
    }
    getItem(key: string): any {
        return this.cookieService.get(key);
    }
    getUsername(): any {
        return this.cookieService.get("username");
    }
    getUserFullname(): any {
        const firstname = this.cookieService.get('firstname');
        const lastname = this.cookieService.get('lastname');
        return firstname && lastname ? `${firstname} ${lastname}` : null;
    }
    checkAccessKey(): boolean {
        return this.cookieService.check('authorise');
    }
    checkRefreshToken(): boolean {
        return this.cookieService.check('sessionId');
    }
    getAccessKey() {
        return this.cookieService.get('authorise');
    }
    getAccessToken() {
        return this.getItem('authorise');
    }
    getRefreshToken() {
        return this.cookieService.get('sessionId');
    }
    getUid() {
        return atob(this.getItem('uid'));
    }
    removeItem(key: string): void {
        this.cookieService.delete(key);
    }
    clear(): void {
        this.cookieService.deleteAll();
        this.cookieService.delete("authorise");
        this.cookieService.delete("uid");
        this.cookieService.delete("sessionId");
        localStorage.clear();
    }
}