import {
  Component,
  EventEmitter,
  Output,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-input.component.html',
  styleUrls: ['./user-input.component.scss'],
})
export class UserInputComponent implements AfterViewInit {
  @Output() sendMessage = new EventEmitter<string>();
  @ViewChild('messageInput') messageInput!: ElementRef<HTMLTextAreaElement>;

  public userInput = '';

  ngAfterViewInit() {
    this.adjustTextareaHeight();
  }

  onInput(): void {
    this.adjustTextareaHeight();
  }

  private adjustTextareaHeight(): void {
    const textarea = this.messageInput.nativeElement;
    const lineHeight = 24; // 1.5rem = 24px
    const maxHeight = lineHeight * 5; // 5 lines

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';

    // Set new height based on content
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;

    // Add/remove scrollbar class based on content height
    if (textarea.scrollHeight > maxHeight) {
      textarea.classList.add('scrollbar-custom');
    } else {
      textarea.classList.remove('scrollbar-custom');
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSendMessage();
    }
  }

  onSendMessage(): void {
    const message = this.userInput.trim();
    if (!message) return;

    this.sendMessage.emit(message);
    this.userInput = '';
    this.adjustTextareaHeight();
  }
}
