import { createReducer, on } from '@ngrx/store';
import * as ChatActions from './chat.actions';
import { ChatState, initialChatState } from './chat.state';

export const chatReducer = createReducer(
  initialChatState,
  on(ChatActions.addMessage, (state, { message }) => ({
    ...state,
    messages: [...state.messages, message]
  })),
  on(ChatActions.updateLastMessage, (state, { content }) => ({
    ...state,
    messages: state.messages.map((msg, index) => 
      index === state.messages.length - 1 
        ? { ...msg, content, loading: false }
        : msg
    )
  })),
  on(ChatActions.setLoading, (state, { loading }) => ({
    ...state,
    loading
  })),
  on(ChatActions.setError, (state, { error }) => ({
    ...state,
    error
  })),
  on(ChatActions.clearMessages, () => initialChatState)
); 