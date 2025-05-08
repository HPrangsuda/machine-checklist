import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Popover } from 'primeng/popover';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  
  @ViewChild('menu') menu!: Popover; 
  
  items: MenuItem[] = [
    { label: 'ข้อมูลผู้ใช้งาน', icon: 'pi pi-user'},
    { label: 'ออกจากระบบ', icon: 'pi pi-sign-out', command: () => this.logout() }
  ];

  constructor(private router: Router) {}

  logout() {
    this.router.navigate(['/login']);
  }
}
