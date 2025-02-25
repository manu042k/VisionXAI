import { ChatMessage } from '../../chat-section/chat-content/message-display.component';

export interface ChatState {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
}

export const initialChatState: ChatState = {
  messages: [],
  loading: false,
  error: null
}; 