import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const connectSocket = (userAddress: string, username?: string) => {
    socket = io('http://localhost:3001');

    socket.on('connect', () => {
        console.log('Connected to server');
        socket?.emit('register', { address: userAddress, username });
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

export const onUserOnline = (callback: (data: any) => void) => {
    if (!socket) return;
    socket.on('user-online', callback);
};

export const onUserOffline = (callback: (data: any) => void) => {
    if (!socket) return;
    socket.on('user-offline', callback);
};

export const createRoom = (name: string, creator: string, tokenGate?: any) => {
    if (!socket) return;
    socket.emit('create-room', { name, creator, tokenGate });
};

export const joinRoom = (roomId: string, userAddress: string, username?: string) => {
    if (!socket) return;
    socket.emit('join-room', { roomId, userAddress, username });
};

export const leaveRoom = (roomId: string, userAddress: string, username?: string) => {
    if (!socket) return;
    socket.emit('leave-room', { roomId, userAddress, username });
};

export const getRoomInfo = (roomId: string) => {
    if (!socket) return;
    socket.emit('get-room', roomId);
};

export const sendRoomMessage = (roomId: string, from: string, text: string, fromUsername?: string) => {
    if (!socket) return;
    socket.emit('send-room-message', {
        roomId,
        from,
        fromUsername,
        text,
        timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    });
};

export const onRoomCreated = (callback: (data: any) => void) => {
    if (!socket) return;
    socket.on('room-created', callback);
};

export const onRoomJoined = (callback: (data: any) => void) => {
    if (!socket) return;
    socket.on('room-joined', callback);
};

export const onUserJoinedRoom = (callback: (data: any) => void) => {
    if (!socket) return;
    socket.on('user-joined-room', callback);
};

export const onUserLeftRoom = (callback: (data: any) => void) => {
    if (!socket) return;
    socket.on('user-left-room', callback);
};

export const onReceiveRoomMessage = (callback: (message: any) => void) => {
    if (!socket) return;
    socket.on('receive-room-message', callback);
};

export const onRoomInfo = (callback: (data: any) => void) => {
    if (!socket) return;
    socket.on('room-info', callback);
};

export const onRoomError = (callback: (error: string) => void) => {
    if (!socket) return;
    socket.on('room-error', callback);
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
