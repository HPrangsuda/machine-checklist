import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, LoginResponse } from '../../../services/auth.service';
import { NotifyService } from '../../../core/service/notify.service';

@Component({
  selector: 'app-signin',
  standalone: false,
  templateUrl: './signin.component.html'
})
export class SigninComponent {
  username: string = '';
  password: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private notifyService: NotifyService
  ) {}

  onSignIn(): void {
    this.authService.login(this.username, this.password).subscribe({
      next: (response: any) => {
        const loginData = response.body as LoginResponse;
        
        if (loginData.code === 200) {
          this.router.navigate(['/dashboard']);
          this.notifyService.msgSuccess('Authentication', 'Success login');
        } else {
          this.notifyService.msgWarn('Authentication', 'Login failed. Check username and password');
        }
      },
      error: (error) => {
        this.notifyService.msgError('Authentication', 'Login failed');
      }
    });
  }
}