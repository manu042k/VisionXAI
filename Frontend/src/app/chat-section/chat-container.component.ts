import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserInputComponent } from './user-input/user-input.component';
import {
  MessageDisplayComponent,
  ChatMessage,
} from './chat-content/message-display.component';
import { LlmService } from '../services/llm.service';
import { catchError, take } from 'rxjs/operators';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { ImageState } from '../+state/image/image.state';
import * as ImageSelectors from '../+state/image/image.selectors';
import * as ChatSelectors from '../+state/chat/chat.selectors';
import * as chatActions from '../+state/chat/chat.actions';
import { LLMInput } from '../constants/llmInput';
import * as ImageActions from '../+state/image/image.actions';

@Component({
  selector: 'app-chat-container',
  standalone: true,
  imports: [CommonModule, UserInputComponent, MessageDisplayComponent],
  templateUrl: './chat-container.component.html',
  styleUrls: ['./chat-container.component.scss'],
})
export class ChatContainerComponent {
  private llmService = inject(LlmService);
  private store = inject(Store);
  private imageUrl$ = this.store.select(ImageSelectors.selectBase64Image);
  messages$ = this.store.select(ChatSelectors.selectMessages);

  constructor() {
    // Debug: Subscribe to messages to verify updates
    this.messages$.subscribe((messages) => {
      console.log('Current messages:', messages);
    });

    // Subscribe to stream updates
    this.llmService.streamText$.subscribe((text) => {
      // Update the last message with streaming text and keep loading true
      this.store.dispatch(
        chatActions.updateLastMessage({
          content: text,
          loading: true, // Keep loading indicator while streaming
        })
      );
    });
  }

  resetAll() {
    // Clear chat messages
    this.store.dispatch(chatActions.clearMessages());

    // Only clear image if one exists
    this.imageUrl$.pipe(take(1)).subscribe((imageUrl) => {
      if (imageUrl) {
        this.store.dispatch(ImageActions.clearImage());
      }
    });
  }

  handleNewMessage(message: string) {
    if (message.toLowerCase() === 'reset') {
      this.resetAll();
      return;
    }

    console.log('Handling new message:', message);
    // Add user message
    this.store.dispatch(
      chatActions.addMessage({
        message: {
          content: message,
          sender: 'USER',
          timestamp: new Date(),
        },
      })
    );

    // Add loading bot message
    this.store.dispatch(
      chatActions.addMessage({
        message: {
          content: '',
          sender: 'BOT',
          timestamp: new Date(),
          loading: true,
        },
      })
    );

    // Get current image URL value
    this.imageUrl$.subscribe(async (imageUrl) => {
      const query: LLMInput = {
        query: message,
        base64Image: imageUrl || '',
      };

      if (query.base64Image !== '' && query.query !== '') {
        try {
          // Start streaming
          await this.llmService.streamChat(query);
          // Only set loading false when stream completes
          this.store.dispatch(
            chatActions.updateLastMessage({
              loading: false,
            })
          );
        } catch (error) {
          this.store.dispatch(
            chatActions.updateLastMessage({
              content: 'Sorry, I encountered an error. Please try again.',
              loading: false,
            })
          );
        }
      }
    });
  }
}
