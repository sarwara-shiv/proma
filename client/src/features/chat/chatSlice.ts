import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatState, MessageType } from './chatTypes';

const initialState: ChatState = {
  messages: [],
  unreadCount: 0,
  onlineUsers: [],
  groups: [],
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setUnreadCount(state, action: PayloadAction<number>) {
      state.unreadCount = action.payload;
    },
    receiveMessage(state, action: PayloadAction<MessageType>) {
      state.messages.push(action.payload);
    },
    loadMessages(state, action: PayloadAction<MessageType[]>) {
      state.messages = action.payload;
    },
    setOnlineUsers(state, action: PayloadAction<string[]>) {
      state.onlineUsers = action.payload;
    },
    clearChatState() {
      return initialState;
    },
  },
});

export const {
  setUnreadCount,
  receiveMessage,
  loadMessages,
  setOnlineUsers,
  clearChatState,
} = chatSlice.actions;

export default chatSlice.reducer;
