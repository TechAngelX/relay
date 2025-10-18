// src/app/services/socket.ts
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io('http://localhost:5001', {
      autoConnect: false,
    });
  }
  return socket;
};
