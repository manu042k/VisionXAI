import { createAction, props } from '@ngrx/store';
import { MessageState } from './message.state';

export const addMessage = createAction(
  '[Chat] Add Message',
  props<{ message: MessageState }>()
);

export const startStreaming = createAction('[Chat] Start Streaming');

export const stopStreaming = createAction('[Chat] Stop Streaming');

export const clearMessages = createAction('[Chat] Clear Messages');
export function updateMessageContent(arg0: { id: string; content: any; }): any {
    throw new Error('Function not implemented.');
}

