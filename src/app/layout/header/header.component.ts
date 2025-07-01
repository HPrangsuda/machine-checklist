import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Popover } from 'primeng/popover';
import { StorageService } from '../../core/service/storage.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  
  @ViewChild('menu') menu!: Popover;
  
  items: MenuItem[] = [
    { label: 'ออกจากระบบ', icon: 'pi pi-sign-out', command: () => this.logout() }
  ];

  username: string | undefined;

  constructor(private router: Router, private storageService: StorageService) {}

  ngOnInit(): void {
    this.username = this.storageService.getFullName().replace("+", " ")
  }

  logout() {
    this.router.navigate(['/login']);
  }
}
