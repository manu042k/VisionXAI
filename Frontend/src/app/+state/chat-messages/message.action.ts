import { createAction, props } from '@ngrx/store';
import { MessageState } from './message.state';
import { LLMInput } from '../../constants/llmInput';

export const addMessage = createAction(
  '[Chat] Add Message',
  props<{ message: MessageState }>()
);

export const startStreaming = createAction(
  '[Message] Start Streaming',
  props<{ query: LLMInput }>()
);

export const streamMessage = createAction(
  '[Message] Stream Message',
  props<{ content: string }>()
);

export const streamComplete = createAction('[Message] Stream Complete');

export const stopStreaming = createAction('[Chat] Stop Streaming');

export const clearMessages = createAction('[Chat] Clear Messages');
export function updateMessageContent(arg0: { id: string; content: any }): any {
  throw new Error('Function not implemented.');
}
