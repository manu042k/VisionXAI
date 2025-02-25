import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ChatState } from './chat.state';

export const selectChatState = createFeatureSelector<ChatState>('chat');

export const selectMessages = createSelector(
  selectChatState,
  (state) => state.messages
);

export const selectLoading = createSelector(
  selectChatState,
  (state) => state.loading
);

export const selectError = createSelector(
  selectChatState,
  (state) => state.error
); 