// src/app/services/socket.ts
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    console.log('Creating new socket connection to localhost:5001');
    socket = io('http://localhost:5001', {
      autoConnect: false,
    });

    socket.on('connect', () => {
      console.log('Socket connected, ID:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }
  return socket;
};
