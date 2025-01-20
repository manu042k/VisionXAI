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
import { addMessage } from 'src/app/+state/chat-messages/message.action';
import { FormsModule } from '@angular/forms';
import { selectImage } from 'src/app/+state/image/image.selectors';
import { LlmService } from 'src/app/services/llm.service';
import { LLMInput } from 'src/app/constants/llmInput';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-user-input',
  imports: [CommonModule, TextareaModule, ButtonModule, AutoFocus, FormsModule],
  templateUrl: './user-input.component.html',
  styleUrl: './user-input.component.scss',
})
export class UserInputComponent implements OnDestroy {
  public placeholder: string = 'Start typing...';
  public userMessage: MessageState = {
    content: '',
    sender: MESSAGETYPE.USER,
    loading: false,
  };
  private store = inject(Store);
  private llmservices = inject(LlmService);
  private query: LLMInput = {
    query: '',
    base64Image: '',
  };

  // Subject to manage unsubscription
  private destroy$ = new Subject<void>();

  public onInputChange(event: Event): void {
    const newContent = (event.target as HTMLInputElement).value.toString();
    this.userMessage = {
      ...this.userMessage,
      content: newContent,
    };
  }

  public onSendMessage(): void {
    this.store.dispatch(addMessage({ message: this.userMessage }));
    this.store
      .select(selectImage)
      .pipe(takeUntil(this.destroy$)) // Automatically unsubscribe on destroy
      .subscribe((value) => {
        this.query = {
          query: this.userMessage.content,
          base64Image: value,
        };
      });

    this.llmservices
      .chatWithLLM(this.query)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        console.log(response);
        this.store.dispatch(
          addMessage({
            message: {
              content: response.response,
              sender: MESSAGETYPE.BOT,
              loading: false,
            },
          })
        );
      });
    this.userMessage = {
      ...this.userMessage,
      content: '',
    };
  }

  // Cleanup the subscription when the component is destroyed
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
