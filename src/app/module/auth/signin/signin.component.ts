import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService, LoginResponse } from '../../../services/auth.service';
import { MessageService } from 'primeng/api';
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
        console.log('Login data:', loginData)

        if((response != null) && (loginData.code == 200)){
          localStorage.setItem("username",loginData.username);
          localStorage.setItem("authorise",loginData.accessToken);
          this.router.navigate(["/dashboard"]);
          this.notifyService.msgSuccess("Authentication","success login");
        }else{
          this.notifyService.msgWarn("Authentication","login failed. Check username and password");
        }
      },
      error: (error) => {
        this.notifyService.msgError("Authentication","login failed");
      }
    });
  }
}