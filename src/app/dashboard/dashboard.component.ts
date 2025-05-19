import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements AfterViewChecked {
  message: string = '';
  messages: string[] = [];
  showOptions = false;

  @ViewChild('chatInput', { static: false }) chatInput!: ElementRef;

  onSendClick(): void {
    if (this.message.trim()) {
      this.messages.push(this.message.trim());
      this.message = ''; // Clear input after sending
    }
    console.log('Send button clicked');
  }

  toggleOptions() {
    this.showOptions = !this.showOptions;
  }

  selectOption(option: string) {
    this.message = option;
    this.showOptions = false;
  }

  onMicClick(): void {
    console.log('Microphone clicked');
  }

  onPlusClick(): void {
    console.log('Plus button clicked');
  }

  ngAfterViewChecked(): void {
    if (this.chatInput) {
      const inputEl = this.chatInput.nativeElement;
      inputEl.style.height = 'auto'; // Reset height
      inputEl.style.height = inputEl.scrollHeight + 'px'; // Set new height
    }
  }

resizeTextarea(): void {
  const input = this.chatInput?.nativeElement;
  if (input) {
    input.style.height = '25px'; // Reset first
    const maxHeight = 1.5 * 16 * 12; // 288px
    input.style.height = Math.min(input.scrollHeight, maxHeight) + 'px';
    input.style.overflowY = input.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }
}
}
