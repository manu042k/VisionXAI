import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { AutoFocus } from 'primeng/autofocus';
import {
  ChatState,
  MessageState,
  MESSAGETYPE,
} from 'src/app/+state/chat-messages/message.state';
import { Store } from '@ngrx/store';
import { addMessage } from 'src/app/+state/chat-messages/message.action';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-input',
  imports: [CommonModule, TextareaModule, ButtonModule, AutoFocus, FormsModule],
  templateUrl: './user-input.component.html',
  styleUrl: './user-input.component.scss',
})
export class UserInputComponent {
  public placeholder: string = 'Start typing...';
  public userMessage: MessageState = {
    content: '',
    sender: MESSAGETYPE.USER,
    loading: false,
  };
  private store = inject(Store);

  public onInputChange(event: Event): void {
    const newContent = (event.target as HTMLInputElement).value.toString();
    this.userMessage = {
      ...this.userMessage,
      content: newContent,
    };
  }
  public onSendMessage(): void {
    this.store.dispatch(addMessage({ message: this.userMessage }));
    this.userMessage = {
      ...this.userMessage,
      content: '',
    };
  }
}
