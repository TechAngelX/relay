// src/services/socket.ts

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const connectSocket = (userAddress: string) => {
    socket = io('http://localhost:3001');

    socket.on('connect', () => {
        console.log('Connected to server');
        socket?.emit('register', userAddress);
    });

    return socket;
};

export const sendMessage = (to: string, from: string, text: string) => {
    if (!socket) return;

    socket.emit('send-message', {
        to,
        from,
        text,
        timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    });
};

export const onReceiveMessage = (callback: (message: any) => void) => {
    if (!socket) return;
    socket.on('receive-message', callback);
};

export const onUserOnline = (callback: (address: string) => void) => {
    if (!socket) return;
    socket.on('user-online', callback);
};

export const onUserOffline = (callback: (address: string) => void) => {
    if (!socket) return;
    socket.on('user-offline', callback);
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
