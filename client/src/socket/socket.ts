import { io, Socket } from 'socket.io-client';
import { store } from '../app/store';
import {
  receiveMessage,
  setUnreadCount,
} from '../features/chat/chatSlice';
import { MessageType } from '../features/chat/chatTypes';

let socket: Socket;

export const initializeSocket = (userId: string) => {
  if (!socket) {
    const API_URL = process.env.REACT_APP_API_URL;
    socket = io(API_URL || 'http://localhost:5000', {
      transports: ['websocket'],
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('🔌 Socket connected:', socket.id);
      socket.emit('user-connected', userId);
    });

    socket.on('unread-messages', (count: number) => {
      store.dispatch(setUnreadCount(count));
    });

    socket.on('receive-private-message', (message: MessageType) => {
      store.dispatch(receiveMessage(message));
    });

    socket.on('receive-group-message', (message: MessageType) => {
      store.dispatch(receiveMessage(message));
    });

    socket.on('receive-admin-message', (message: MessageType) => {
      store.dispatch(receiveMessage(message));
    });
  }

  return socket;
};

export const getSocket = () => socket;
