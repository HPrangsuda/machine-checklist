import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { RoleType } from '../../../models/role-type.enum';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-user-add',
  standalone: false,
  templateUrl: './user-add.component.html',
  styleUrls: ['./user-add.component.scss']
})
export class UserAddComponent implements OnInit {

  userForm: FormGroup;
  roleTypes = Object.values(RoleType);
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private fb: FormBuilder, private userService: UserService) {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: [''],
      username: ['', Validators.required],
      password: ['', Validators.required],
      employeeId: [''],
      position: [''],
      department: [''],
      role: [RoleType.USER]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.userForm.valid) {
      this.userService.createUser(this.userForm.value).subscribe({
        next: (response) => {
          this.successMessage = 'User created successfully!';
          this.errorMessage = '';
          this.userForm.reset({ role: RoleType.USER });
        },
        error: (error) => {
          this.errorMessage = error.error || 'Failed to create user';
          this.successMessage = '';
        }
      });
    }
  }
}
