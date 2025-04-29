import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { MessageService } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { RoleType } from '../../../models/role-type.enum';
import { Observable, of } from 'rxjs';
import { map, catchError, debounceTime, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-user-add',
  standalone: false,
  templateUrl: './user-add.component.html',
  styleUrls: ['./user-add.component.scss']
})
export class UserAddComponent implements OnInit {
  userForm: FormGroup;
  loading: boolean = false;
  
  statusOptions = [
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Inactive', value: 'INACTIVE' }
  ];

  roleOptions: { label: string; value: RoleType }[] = [];

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private location: Location,
    private messageService: MessageService,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      employeeId: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      nickName: [''],
      department: ['', Validators.required],
      position: ['' , Validators.required],
      status:['', Validators.required],
      username: ['', [Validators.required], [this.usernameExistsValidator()]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.roleOptions = Object.keys(RoleType).map(key => ({
      label: key, 
      value: RoleType[key as keyof typeof RoleType], 
    }));
  }

  // Validator to check if username already exists
  usernameExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {
      if (!control.value || control.value.length === 0) {
        return of(null);
      }
      
      return this.userService.checkUsernameExists(control.value).pipe(
        debounceTime(300),
        switchMap(exists => {
          return exists ? of({ usernameExists: true }) : of(null);
        }),
        catchError(() => of(null))
      );
    };
  }

  saveUser(): void {
    if (this.userForm.invalid) {
      // ตรวจสอบข้อผิดพลาดจากการตรวจสอบความถูกต้อง
      if (this.userForm.get('username')?.hasError('usernameExists')) {
        this.messageService.add({
          severity: 'warn',
          summary: 'ชื่อผู้ใช้ซ้ำ',
          detail: 'ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว กรุณาใช้ชื่อผู้ใช้อื่น'
        });
      } else if (this.userForm.get('password')?.hasError('required')) {
        this.messageService.add({
          severity: 'warn',
          summary: 'ไม่ได้ระบุรหัสผ่าน',
          detail: 'กรุณาระบุรหัสผ่าน'
        });
      } else if (this.userForm.get('password')?.hasError('minlength')) {
        this.messageService.add({
          severity: 'warn',
          summary: 'รหัสผ่านสั้นเกินไป',
          detail: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร'
        });
      } else {
        this.messageService.add({
          severity: 'warn',
          summary: 'ข้อมูลไม่ครบถ้วน',
          detail: 'กรุณากรอกข้อมูลที่จำเป็น'
        });
      }
      this.userForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    
    // ตรวจสอบให้แน่ใจว่า password ไม่เป็น null หรือค่าว่าง
    if (!this.userForm.value.password) {
      this.messageService.add({
        severity: 'error',
        summary: 'ข้อผิดพลาด',
        detail: 'กรุณาระบุรหัสผ่าน'
      });
      this.loading = false;
      return;
    }
    
    const userData = {
      employeeId: this.userForm.value.employeeId,
      firstName: this.userForm.value.firstName,
      lastName: this.userForm.value.lastName, 
      nickName: this.userForm.value.nickName || '', // เพิ่มค่าเริ่มต้นเป็นสตริงว่างถ้าไม่มีค่า
      department: this.userForm.value.department,
      position: this.userForm.value.position,
      status: this.userForm.value.status,
      username: this.userForm.value.username,
      password: this.userForm.value.password,
      role: this.userForm.value.role
    };
    
    console.log('User Data:', userData);
    
    this.userService.addUser(userData).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'สำเร็จ',
          detail: 'บันทึกผู้ใช้งานเรียบร้อยแล้ว'
        });
        this.loading = false;
        setTimeout(() => this.location.back(), 1000);
      },
      error: (err: any) => {
        console.error('Error saving user:', err);
        // ตรวจสอบข้อความแสดงข้อผิดพลาดเฉพาะจากเซิร์ฟเวอร์
        if (err.error && typeof err.error === 'string') {
          if (err.error.includes('username already exists')) {
            this.messageService.add({
              severity: 'error',
              summary: 'ข้อผิดพลาด',
              detail: 'ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว กรุณาใช้ชื่อผู้ใช้อื่น'
            });
          } else if (err.error.includes('password cannot be null')) {
            this.messageService.add({
              severity: 'error',
              summary: 'ข้อผิดพลาด',
              detail: 'กรุณาระบุรหัสผ่าน'
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'ข้อผิดพลาด',
              detail: 'ไม่สามารถบันทึกได้: ' + err.error
            });
          }
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'ข้อผิดพลาด',
            detail: 'ไม่สามารถบันทึกได้: ' + (err.error?.message || 'Unknown error')
          });
        }
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.location.back();
  }
}