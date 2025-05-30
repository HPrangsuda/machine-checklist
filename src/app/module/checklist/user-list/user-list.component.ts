import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { User } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';
import { StorageService } from '../../../core/service/storage.service';
import { PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-user-list',
  standalone: false,
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  role: string | undefined;
  user: User[] = [];
  filteredUsers: User[] = [];
  loading: boolean = true;
  searchQuery: string = '';
  
  first: number = 0;
  rows: number = 5;

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private router: Router,
    private confirmationService: ConfirmationService,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (data: User[]) => {
        this.user = data;
        this.filteredUsers = [...this.user]; 
        this.first = 0;
        this.loading = false;
      },
      error: (err: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load users: ' + (err.message || 'Unknown error')
        });
        this.loading = false;
      }
    });
  }
  
  applyFilters(): void {
    let tempUsers = [...this.user];

    if (this.searchQuery.trim()) {
      tempUsers = tempUsers.filter(user =>
        user.firstName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (user.employeeId ?? '').toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (user.department ?? '').toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    this.filteredUsers = tempUsers;
    this.first = 0; 
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.filteredUsers = [...this.user];
    this.first = 0;
  }

  onPageChange(event: PaginatorState): void {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 5;
  }

  onUserDetail(id: number): void {
    this.router.navigate(['/user-detail', id]);
  }

  onAdd(): void {
    this.router.navigate(['/user-add']);
  }
  
  onEdit(id: number): void {
    this.router.navigate(['/user-edit', id]);
  }

  onDelete(id: number): void {
    this.confirmationService.confirm({
      message: 'คุณต้องการลบผู้ใช้นี้หรือไม่?',
      header: 'ยืนยันการลบ',
      rejectLabel: 'ยกเลิก',
      rejectButtonProps: {
        style: { 'font-size': '12px' },
        label: 'ยกเลิก',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        style: { 'font-size': '12px' },
        label: 'ลบ',
        severity: 'danger',
      },
      accept: () => {
        this.userService.deleteUser(id).subscribe({
          next: () => {
            this.user = this.user.filter(user => user.id !== id);
            this.filteredUsers = this.filteredUsers.filter(user => user.id !== id);
            this.first = 0; 
            this.messageService.add({
              severity: 'info',
              summary: 'สำเร็จ',
              detail: 'ลบผู้ใช้เรียบร้อยแล้ว'
            });
          },
          error: (err: any) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'ไม่สามารถลบผู้ใช้ได้: ' + (err.message || 'Unknown error')
            });
          }
        });
      },
      reject: () => {
        this.messageService.add({
          severity: 'warn',
          summary: 'ยกเลิก',
          detail: 'คุณได้ยกเลิกการลบ'
        });
      }
    });
  }

  getRoleClass(status: string): string {
    switch (status.toUpperCase()) {
      case 'ADMIN': return 'tag-danger';
      case 'MANAGER': return 'tag-orange';
      case 'SUPERVISOR': return 'tag-warn';
      case 'MEMBER': return 'tag-success';
      default: return 'tag-secondary';
    }
  }
}