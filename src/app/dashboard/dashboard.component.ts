import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

interface ChatMessage {
  from: 'user' | 'bot';
  text: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule, ToastModule],
  providers: [MessageService],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements AfterViewChecked {
  message: string = '';
  messages: ChatMessage[] = [];
  isLoading: boolean = false;
  selectedLabel: string | null = null;

  @ViewChild('chatInput', { static: false }) chatInput!: ElementRef;
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  constructor(private http: HttpClient, private messageService: MessageService) {}

  ngAfterViewChecked(): void {
    this.adjustTextareaHeight();
    this.scrollToBottom();
  }

  onSendClick(): void {
    if (!this.selectedLabel) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select a label before sending.'
      });
      return;
    }

    const trimmedMsg = this.message.trim();
    if (trimmedMsg) {
      this.messages.push({ from: 'user', text: trimmedMsg });
      this.callAPI(this.selectedLabel.toLowerCase() as 'completion' | 'repository' | 'insertion', trimmedMsg);
      this.message = '';
    }
  }

  resizeTextarea(): void {
    this.adjustTextareaHeight();
  }

  adjustTextareaHeight(): void {
    const input = this.chatInput?.nativeElement;
    if (input) {
      input.style.height = '25px';
      const maxHeight = 1.5 * 16 * 12; // 12 lines
      input.style.height = Math.min(input.scrollHeight, maxHeight) + 'px';
      input.style.overflowY = input.scrollHeight > maxHeight ? 'auto' : 'hidden';
    }
  }

  scrollToBottom(): void {
    if (this.messagesContainer) {
      const container = this.messagesContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    }
  }

  selectLabel(label: string): void {
    this.selectedLabel = label;
  }

  callAPI(endpoint: 'completion' | 'repository' | 'insertion', prompt: string): void {
    const user_id = localStorage.getItem('user_id');
    const token = localStorage.getItem('token');
    const chat_id = sessionStorage.getItem('chat_id');
    const project_tag = sessionStorage.getItem('project_tag');

    if (!user_id || !token) {
      this.messageService.add({
        severity: 'error',
        summary: 'Authorization Error',
        detail: 'User ID or token is missing in local storage.'
      });
      return;
    }

    if (!chat_id || !project_tag) {
      this.messageService.add({
        severity: 'error',
        summary: 'Session Error',
        detail: 'Chat ID or project tag is missing in session storage.'
      });
      return;
    }

    const url = `http://192.168.0.85:8080/${endpoint}`;
    const body = {
      prompt,
      chat_id,
      user_context: {
        user_id,
        project_tag
      }
    };

    this.isLoading = true;

    this.http.post<any>(url, body, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        accept: 'application/json'
      }
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res?.data?.model_output) {
          this.messages.push({ from: 'bot', text: res.data.model_output });
        } else {
          this.messageService.add({ severity: 'info', summary: 'Info', detail: `${endpoint} successful but no response.` });
        }
      },
      error: () => {
        this.isLoading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: `${endpoint} API call failed.` });
      }
    });
  }
}
