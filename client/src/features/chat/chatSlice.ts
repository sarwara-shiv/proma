import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatState, MessageType, UnreadCountMap } from './chatTypes';

const initialState: ChatState = {
  messages: [],
  unreadCount: 0,
  unreadMessages: {}, // Unread count per sender or group
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
    setUnreadMessages(state, action: PayloadAction<UnreadCountMap>) {
      console.log(action.payload);
      state.unreadMessages = action.payload;
    },
    loadMessages(state, action: PayloadAction<MessageType[]>) {
      state.messages = action.payload;
    },
    setOnlineUsers(state, action: PayloadAction<string[]>) {
      state.onlineUsers = action.payload;
    },
    // Corrected: Clear unread messages for a specific sender or group
    clearUnreadMessagesFrom(state, action: PayloadAction<{ senderId: string }>) {
      const { senderId } = action.payload;
      // Delete the sender/group from unreadMessages
      const updatedUnreadMessages = { ...state.unreadMessages };
      delete updatedUnreadMessages[senderId];
      state.unreadMessages = updatedUnreadMessages;
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
  setUnreadMessages,
  setOnlineUsers,
  clearChatState,
  clearUnreadMessagesFrom,
} = chatSlice.actions;

export default chatSlice.reducer;
