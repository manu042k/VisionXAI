import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewChecked,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LlmResponseComponent } from './llm-response/llm-response.component';
import { UserResponseComponent } from './user-response/user-response.component';
import { Scroller } from 'primeng/scroller';
import { ChatState, MessageState } from '../+state/chat-messages/message.state';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  selectLoading,
  selectMessages,
} from '../+state/chat-messages/message.selectors';

@Component({
  selector: 'app-main-chat',
  imports: [
    CommonModule,
    LlmResponseComponent,
    UserResponseComponent,
    Scroller,
  ],
  templateUrl: './main-chat.component.html',
  styleUrls: ['./main-chat.component.scss'],
})
export class MainChatComponent implements AfterViewChecked, OnInit {
  isLoading: boolean = false;
  message = 'testing';
  messages$: Observable<MessageState[]>;
  loading$: Observable<boolean>;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  isAtBottom: boolean = true; // Track if the user is at the bottom

  constructor(private store: Store<ChatState>) {
    this.messages$ = this.store.select(selectMessages);
    this.loading$ = this.store.select(selectLoading);
  }

  ngOnInit() {
    // Reset the isAtBottom flag when component initializes
    this.isAtBottom = true;
  }

  ngAfterViewChecked(): void {
    if (this.isAtBottom) {
      // Only scroll to the bottom if the user is at the bottom
      this.scrollToBottom();
    }
  }

  onScroll(): void {
    const element = this.scrollContainer.nativeElement;
    const isBottom =
      element.scrollHeight === element.scrollTop + element.clientHeight;
    this.isAtBottom = isBottom; // Check if the user is at the bottom of the container
  }

  scrollToBottom(): void {
    if (this.scrollContainer) {
      const element = this.scrollContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }
}
