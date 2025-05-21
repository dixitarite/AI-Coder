import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem'; // This should be a valid standalone directive/component
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [
        CommonModule,
        HttpClientModule,
        AppMenuitem,
        RouterModule,
        FormsModule,
        DialogModule,
        InputTextModule,
        ButtonModule
    ],
    template: `
        <ul class="layout-menu">
            <!-- New Chat Button -->
            <li class="new-chat-button-container">
                <button
                    (click)="showDialog = true"
                    class="p-button p-button-primary p-button-sm w-full"
                    style="margin: 1rem 0; font-weight: 500; background-color: #0ea5e9 !important; border-color: #0ea5e9 !important;"
                >
                    <span class="p-button-label">Create New Chat</span>
                </button>
            </li>

            <!-- Chat History Menu -->
            <ng-container *ngFor="let item of model; let i = index">
                <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
                <li *ngIf="item.separator" class="menu-separator"></li>
            </ng-container>
        </ul>

        <p-dialog
            header="Create New Chat"
            [(visible)]="showDialog"
            [modal]="true"
            [closable]="true"
            [style]="{width: '350px'}"
        >
            <div class="p-fluid">
                <div class="p-field" style="margin-bottom: 1rem;">
                    <label for="chatName" style="display: block; margin-bottom: 0.5rem;">Chat Name</label>
                    <input
                        id="chatName"
                        type="text"
                        pInputText
                        [(ngModel)]="chatName"
                        style="width: 100%; padding: 0.5rem;"
                    />
                </div>
                <div class="p-field" style="margin-bottom: 1rem;">
                    <label for="projectTag" style="display: block; margin-bottom: 0.5rem;">Project Tag</label>
                    <input
                        id="projectTag"
                        type="text"
                        pInputText
                        [(ngModel)]="projectTag"
                        style="width: 100%; padding: 0.5rem;"
                    />
                </div>
            </div>

            <ng-template pTemplate="footer">
                <button
                    type="button"
                    pButton
                    label="Cancel"
                    class="p-button-text"
                    style="color: #0ea5e9 !important;"
                    (click)="showDialog = false"
                ></button>
                <button
                    type="button"
                    pButton
                    label="Save"
                    style="background-color: #0ea5e9 !important; border-color: #0ea5e9 !important; color: white !important;"
                    (click)="createNewChat()"
                ></button>
            </ng-template>
        </p-dialog>
    `
})
export class AppMenu implements OnInit {
    model: MenuItem[] = [];
    showDialog: boolean = false;
    chatName: string = '';
    projectTag: string = '';

    constructor(private http: HttpClient, private router: Router) {}

    ngOnInit() {
        this.loadChatHistory();
    }
loadChatHistory() {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('user_id');

  if (!token || !userId) {
    console.error('Missing token or user_id in localStorage');
    this.router.navigate(['/login']);
    return;
  }

  const headers = new HttpHeaders({
    'accept': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  const url = `${environment.chatUrl}/get_chats?user_id=${userId}`;

  this.http.post<any>(url, {}, { headers }).subscribe({
    next: (response) => {
      if (response.code === 200 && Array.isArray(response.data)) {
        const chatItems = response.data.map((chat: any) => ({
          label: chat.chat_name,
          routerLink: ['/chat', chat.chat_id]
        }));

        this.model = [
          {
            label: 'Chat History',
            items: chatItems
          }
        ];
      } else {
        console.error('Unexpected response format', response);
      }
    },
    error: (err) => {
      console.error('Failed to fetch chat history', err);

      // Check if error is token expired
      if (
        err.status === 401 && 
        err.error?.detail?.toLowerCase().includes('token') // or a more precise check
      ) {
        localStorage.clear();
        this.router.navigate(['/login']);
      }
    }
  });
}

    createNewChat() {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('user_id');

        if (!token || !userId) {
            console.error('Missing token or user_id in localStorage');
            return;
        }

        if (!this.chatName || !this.projectTag) {
            console.error('Chat name and project tag are required');
            return;
        }

        const headers = new HttpHeaders({
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });

        const payload = {
            user_id: parseInt(userId),
            chat_name: this.chatName,
            project_tag: this.projectTag
        };

        const url = `${environment.chatUrl}/new_chat`;

        this.http.post<any>(url, payload, { headers }).subscribe({
            next: (response) => {
                if (response.code === 200 && response.data?.chat_id) {

                    const chatId = response.data.chat_id;
                    sessionStorage.setItem('chat_id', chatId);
                    sessionStorage.setItem('chat_name', this.chatName);
                    sessionStorage.setItem('project_tag', this.projectTag);

                    this.showDialog = false;
                    this.chatName = '';
                    this.projectTag = '';
                    this.router.navigate(['/generate']).then(() => {
  window.location.reload(); 
});
                    this.loadChatHistory(); 
                } else {
                    console.error('Failed to create chat', response);
                }
            },
            error: (err) => {
                console.error('Error creating new chat', err);
            }
        });
    }
}
