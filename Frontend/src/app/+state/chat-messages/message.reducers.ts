import { createReducer, on } from '@ngrx/store';
import { ChatState, MessageState, MESSAGETYPE } from './message.state';
import * as ChatActions from './message.action';

const initialMessage: MessageState = {
  content: 'Hello, How can I help you?',
  sender: MESSAGETYPE.BOT,
  loading: false,
};
const initialState: ChatState = {
  messages: [initialMessage],
  loading: false,
  streamLoading: false,
};

export const chatReducer = createReducer(
  initialState,
  on(ChatActions.addMessage, (state: ChatState, { message }) => ({
    ...state,
    messages: [...state.messages, message],
  })),

  on(ChatActions.startStreaming, (state: ChatState) => ({
    ...state,
    streamLoading: true,
  })),
  on(ChatActions.stopStreaming, (state: ChatState) => ({
    ...state,
    streamLoading: false,
  })),
  on(ChatActions.clearMessages, (state: ChatState) => ({
    ...state,
    messages: [initialMessage],
  }))
);
