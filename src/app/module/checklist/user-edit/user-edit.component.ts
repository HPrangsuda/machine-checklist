import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { NotifyService } from '../../../core/service/notify.service';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';
import { RoleType } from '../../../models/role-type.enum';

@Component({
  selector: 'app-user-edit',
  standalone: false,
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss'],
})
export class UserEditComponent implements OnInit {
  user: User | null = null;
  userForm: FormGroup;
  error: string | null = null;
  loading: boolean = false;
  statusOptions: { label: string; value: string }[] = [
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Inactive', value: 'INACTIVE' },
  ];
  roleOptions: { label: string; value: RoleType }[] = [];

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private location: Location,
    private notifyService: NotifyService,
    private fb: FormBuilder
  ) {
    // Initialize the form
    this.userForm = this.fb.group({
      employeeId: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: [''],
      nickName: [''],
      department: ['', Validators.required],
      position: ['', Validators.required],
      status: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
      role: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.roleOptions = Object.keys(RoleType).map(key => ({
      label: key, 
      value: RoleType[key as keyof typeof RoleType], 
    }));
    
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!isNaN(id)) {
      this.loading = true;
      this.userService.getUserById(id).subscribe({
        next: (response: User) => {
          this.user = response;
          this.userForm.patchValue({
            employeeId: response.employeeId,
            firstName: response.firstName,
            lastName: response.lastName,
            nickName: response.nickName,
            department: response.department,
            position: response.position,
            status: response.status,
            username: response.username,
            password: '',
            role: response.role,
          });
          this.loading = false;
        },
        error: (err) => {
          this.error = 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้';
          this.notifyService.msgError('ผิดพลาด', 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
          console.error('Error:', err);
          this.loading = false;
        },
      });
    } else {
      this.error = 'รหัสผู้ใช้ไม่ถูกต้อง';
      this.notifyService.msgError('ผิดพลาด', 'รหัสผู้ใช้ไม่ถูกต้อง');
    }
  }

  saveUser(): void {
    if (!this.user?.id || this.userForm.invalid) {
      this.error = 'ข้อมูลไม่ครบถ้วนหรือไม่ถูกต้อง';
      this.notifyService.msgWarn('ผิดพลาด', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      this.userForm.markAllAsTouched();
      return;
    }

    const updatedUser: User = {
      ...this.user,
      ...this.userForm.value,
    };
    this.loading = true;
    this.userService.updateUser(this.user.id, updatedUser).subscribe({
      next: (response: User) => {
        this.user = response;
        this.loading = false;
        this.notifyService.msgSuccess('สำเร็จ', 'อัปเดตข้อมูลผู้ใช้เรียบร้อยแล้ว');
        console.log('Update successful:', response);
      },
      error: (err) => {
        this.error = 'ไม่สามารถอัปเดตข้อมูลผู้ใช้ได้';
        this.notifyService.msgWarn('ผิดพลาด', 'ไม่สามารถอัปเดตข้อมูลผู้ใช้ได้');
        console.error('Update error:', err);
        this.loading = false;
      },
    });
  }

  goBack(): void {
    this.location.back();
  }
}