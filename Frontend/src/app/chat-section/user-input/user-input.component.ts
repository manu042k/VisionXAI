import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { AutoFocus } from 'primeng/autofocus';
import {
  MessageState,
  MESSAGETYPE,
} from 'src/app/+state/chat-messages/message.state';
import { Store } from '@ngrx/store';
import {
  addMessage,
  startStreaming,
} from 'src/app/+state/chat-messages/message.action';
import { FormsModule } from '@angular/forms';
import { selectImage } from 'src/app/+state/image/image.selectors';
import { LlmService } from 'src/app/services/llm.service';
import { LLMInput } from 'src/app/constants/llmInput';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-user-input',
  standalone: true,
  imports: [
    CommonModule,
    TextareaModule,
    ButtonModule,
    AutoFocus,
    FormsModule,
    ToastModule,
  ],
  templateUrl: './user-input.component.html',
  providers: [MessageService],
})
export class UserInputComponent implements OnDestroy {
  public placeholder: string = 'Start typing...';
  public userMessage: MessageState = {
    content: '',
    sender: MESSAGETYPE.USER,
    loading: false,
  };

  private store = inject(Store);
  private llmService = inject(LlmService);
  private messageService = inject(MessageService);
  private destroy$ = new Subject<void>();
  private query: LLMInput = {
    query: '',
    base64Image: '',
  };

  public onInputChange(event: Event): void {
    const newContent = (event.target as HTMLInputElement).value.toString();
    this.userMessage = {
      ...this.userMessage,
      content: newContent,
    };
  }

  public async onSendMessage(): Promise<void> {
    try {
      if (!this.userMessage.content.trim()) {
        return;
      }

      // Dispatch user message to store
      this.store.dispatch(addMessage({ message: this.userMessage }));

      // Get image from store and start streaming
      this.store
        .select(selectImage)
        .pipe(takeUntil(this.destroy$))
        .subscribe((value) => {
          this.query = {
            query: this.userMessage.content,
            base64Image: value,
          };

          // Dispatch streaming action
          this.store.dispatch(startStreaming({ query: this.query }));
        });

      // Clear input after sending
      this.userMessage = {
        ...this.userMessage,
        content: '',
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: any): void {
    console.error('Error sending message:', error);
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to send message',
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
