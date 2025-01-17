export enum MESSAGETYPE {
  USER = 'User',
  BOT = 'LLM',
}

export interface MessageState {
  sender: MESSAGETYPE;
  content: string;
  loading: boolean;
}
export interface ChatState {
  messages: MessageState[];
  loading: boolean;
  streamLoading: boolean;
}
