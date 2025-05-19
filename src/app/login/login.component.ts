import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { DialogModule } from 'primeng/dialog';
import { environment } from '../../environments/environment';  // Import environment

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    PasswordModule,
    FormsModule,
    RouterModule,
    RippleModule,
    ToastModule,
    DialogModule,
    HttpClientModule
  ],
  templateUrl: './login.component.html',
  providers: [MessageService]
})
export class LoginComponent implements OnInit {
  username: string = '';
  password: string = '';
  checked: boolean = false;

  displayCreateAccount = false;

  createUser = {
    user_id: '',
    email_id: '',
    username: '',
    password: '',
    confirmPassword: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const savedUsername = localStorage.getItem('rememberedUsername');
    const savedPassword = localStorage.getItem('rememberedPassword');

    if (savedUsername && savedPassword) {
      this.username = savedUsername;
      this.password = savedPassword;
      this.checked = true;
    }
  }

  login() {
    this.authService.login(this.username, this.password).subscribe({
      next: (res) => {
        if (res.code === 200) {
          localStorage.setItem('token', res.data.token);

          if (this.checked) {
            localStorage.setItem('rememberedUsername', this.username);
            localStorage.setItem('rememberedPassword', this.password);
          } else {
            localStorage.removeItem('rememberedUsername');
            localStorage.removeItem('rememberedPassword');
          }

          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Login successful'
          });
          localStorage.setItem("username", this.username);
          this.router.navigate(['/generate']);


        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Login Failed',
            detail: res.message
          });
        }
      },
      error: (err) => {
        console.error('Login error', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Login error occurred'
        });
      }
    });
  }

  openCreateAccount() {
    this.displayCreateAccount = true;
  }

  cancelCreateAccount() {
    this.displayCreateAccount = false;
    this.createUser = {
      user_id: '',
      email_id: '',
      username: '',
      password: '',
      confirmPassword: ''
    };
  }

  isCreateFormValid(): boolean {
    const { user_id, email_id, username, password, confirmPassword } = this.createUser;
    return (
      user_id.trim() !== '' &&
      email_id.trim() !== '' &&
      username.trim() !== '' &&
      password.trim() !== '' &&
      confirmPassword.trim() !== '' &&
      password === confirmPassword
    );
  }

  createAccount() {
    const url = `${environment.apiBaseUrl}/create_user`;

    const payload = {
      ...this.createUser,
      user_id: String(this.createUser.user_id)
    };

    this.http.post<any>(url, payload).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Account created successfully'
        });
        this.displayCreateAccount = false;
        this.cancelCreateAccount();
      },
      error: (err) => {
        console.error('Create account error', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create account'
        });
      }
    });
  }
}
