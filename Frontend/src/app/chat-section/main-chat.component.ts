import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LlmResponseComponent } from './llm-response/llm-response.component';
import { UserResponseComponent } from './user-response/user-response.component';
import { Scroller } from 'primeng/scroller';
@Component({
  selector: 'app-main-chat',
  imports: [
    CommonModule,
    LlmResponseComponent,
    UserResponseComponent,
    Scroller,
  ],
  templateUrl: './main-chat.component.html',
  styleUrl: './main-chat.component.scss',
})
export class MainChatComponent {
  isLoading: boolean = false;
  message = 'testing';
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  ngAfterViewInit(): void {
    // Ensure the scrollbar is at the bottom after initial load
    this.scrollToBottom();
  }

  ngOnChanges(): void {
    // Scroll to the bottom when new messages are added
    this.scrollToBottom();
  }
  scrollToBottom(): void {
    if (this.scrollContainer) {
      const element = this.scrollContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }
}
