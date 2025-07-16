import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, LoginResponse } from '../../../services/auth.service';
import { NotifyService } from '../../../core/service/notify.service';

@Component({
  selector: 'app-signin',
  standalone: false,
  templateUrl: './signin.component.html'
})
export class SigninComponent implements OnInit {
  username: string = '';
  password: string = '';
  rememberMe: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private notifyService: NotifyService
  ) {}

  ngOnInit(): void {
    // Load saved credentials if they exist
    const savedUsername = localStorage.getItem('rememberedUsername');
    const savedPassword = localStorage.getItem('rememberedPassword');
    if (savedUsername && savedPassword) {
      this.username = savedUsername;
      this.password = savedPassword;
      this.rememberMe = true;
    }
  }

  onSignIn(): void {
    // Save credentials if rememberMe is checked
    if (this.rememberMe) {
      localStorage.setItem('rememberedUsername', this.username);
      localStorage.setItem('rememberedPassword', this.password);
    } else {
      localStorage.removeItem('rememberedUsername');
      localStorage.removeItem('rememberedPassword');
    }

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