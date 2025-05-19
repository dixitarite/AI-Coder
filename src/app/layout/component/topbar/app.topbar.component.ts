import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from '../app.configurator';
import { LayoutService } from '../../service/layout.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MenuModule } from 'primeng/menu';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';


@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    StyleClassModule,
    FormsModule,
    AppConfigurator,
    ButtonModule,
    PasswordModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    MenuModule,
    HttpClientModule
  ],
  templateUrl: './app.topbar.component.html',
  styleUrls: ['./app.topbar.component.scss'],
  providers: [LayoutService, ConfirmationService, MessageService]
})
export class AppTopbar {
  confirmDialog: boolean = false;
  visible: boolean = false;
  items: MenuItem[] = [];

  oldpassword: string = '';
  newpassword: string = '';
  confirmedpass: string = '';

  // Initialize URLs here

  private apiBaseUrl: string = environment.apiBaseUrl;
private changePasswordEndpoint: string = environment.changePasswordEndpoint;
private logoutEndpoint: string = environment.logoutEndpoint;


  constructor(
    public layoutService: LayoutService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private http: HttpClient
  ) {}

  ngOnInit() {

    this.items = [
      {
        label: 'Profile',
        items: [
          {
            label: 'Change Password',
            icon: 'pi pi-key',
            command: () => this.showDialog()
          },
          {
            label: 'Logout',
            icon: 'pi pi-sign-out',
            command: () => this.showLogoutConfirm()
          }
        ]
      }
    ];
  }

  showDialog() {
    this.visible = true;
  }

  showLogoutConfirm() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to logout?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.logoutConfirmed(),
      reject: () => this.navigateToDashboardPage()
    });
  }

  logoutConfirmed() {
  const token = localStorage.getItem('token');
  if (!token) {
    localStorage.clear();
    window.location.href = '/';
    return;
  }

  const url = `${this.apiBaseUrl}${this.logoutEndpoint}`;

  this.http.post(url, {}, {
    headers: {
      'accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).subscribe({
    next: (response: any) => {
      this.messageService.add({
        severity: 'success',
        summary: 'Logout',
        detail: response.message || 'Logout successful'
      });
      localStorage.clear();
      window.location.href = '/';
    },
    error: (err) => {
      this.messageService.add({
        severity: 'error',
        summary: 'Logout Failed',
        detail: err.error?.message || 'Could not logout properly'
      });
      localStorage.clear();
      window.location.href = '/';
    }
  });
}

  navigateToDashboardPage() {
    window.location.href = '/generate';
  }

  clearDialogFields() {
    this.oldpassword = '';
    this.newpassword = '';
    this.confirmedpass = '';
    this.visible = false;
  }

 changePassword(): void {
  const username = localStorage.getItem('username');
  const token = localStorage.getItem('token');

//   if (username || token) {
//     this.messageService.add({
//       severity: 'error',
//       summary: 'Unauthorized',
//       detail: 'Missing credentials. Please log in again.'
//     });
//     return;
//   }

  if (this.newpassword !== this.confirmedpass) {
    this.messageService.add({
      severity: 'error',
      summary: 'Mismatch',
      detail: 'New password and confirmation do not match.'
    });
    return;
  }

  const payload = {
    username: username,
    old_password: this.oldpassword,
    new_password: this.newpassword
  };

  const url = `${this.apiBaseUrl}${this.changePasswordEndpoint}`;

  this.http.post(url, payload, {
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).subscribe({
    next: (data) => {
      this.messageService.add({
        severity: 'success',
        summary: 'Password Changed',
        detail: 'Your password has been updated.'
      });
      this.clearDialogFields();
    },
    error: (error) => {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error.error?.message || 'Failed to change password.'
      });
    }
  });
}

}
