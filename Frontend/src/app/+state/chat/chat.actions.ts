import { createAction, props } from '@ngrx/store';
import { ChatMessage } from '../../chat-section/chat-content/message-display.component';

export const addMessage = createAction(
  '[Chat] Add Message',
  props<{ message: ChatMessage }>()
);

export const updateLastMessage = createAction(
  '[Chat] Update Last Message',
  props<{ content?: string; loading?: boolean }>()
);

export const setLoading = createAction(
  '[Chat] Set Loading',
  props<{ loading: boolean }>()
);

export const setError = createAction(
  '[Chat] Set Error',
  props<{ error: string }>()
);

export const clearMessages = createAction('[Chat] Clear Messages');
