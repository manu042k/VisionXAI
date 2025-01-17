import { createFeatureSelector, createSelector } from "@ngrx/store";
import { ChatState } from "./message.state";


export const selectChatState = createFeatureSelector<ChatState>('chat');

export const selectMessages = createSelector(
    selectChatState,
    (state: ChatState) => state.messages
  );
  
  export const selectLoading = createSelector(
    selectChatState,
    (state: ChatState) => state.loading
  );
  
  export const selectStreamLoading = createSelector(
    selectChatState,
    (state: ChatState) => state.streamLoading
  );