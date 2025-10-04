// server/src/server.ts

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

const connectedUsers = new Map<string, string>();

interface Room {
  id: string;
  name: string;
  creator: string;
  participants: Set<string>;
  tokenGate?: {
    tokenAddress: string;
    minBalance: number;
  };
  createdAt: number;
}

const rooms = new Map<string, Room>();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('register', (address: string) => {
    connectedUsers.set(address, socket.id);
    console.log('User registered:', address);
    io.emit('user-online', address);
  });

  // Create room
  socket.on('create-room', (data: {
    name: string;
    creator: string;
    tokenGate?: { tokenAddress: string; minBalance: number }
  }) => {
    const roomId = uuidv4();

    const room: Room = {
      id: roomId,
      name: data.name,
      creator: data.creator,
      participants: new Set([data.creator]),
      tokenGate: data.tokenGate,
      createdAt: Date.now()
    };

    rooms.set(roomId, room);
    socket.join(roomId);

    socket.emit('room-created', {
      roomId,
      url: `http://localhost:5173/room/${roomId}`,
      room: {
        ...room,
        participants: Array.from(room.participants)
      }
    });

    console.log('Room created:', roomId);
  });

  // Join room
  socket.on('join-room', (data: { roomId: string; userAddress: string }) => {
    const room = rooms.get(data.roomId);

    if (!room) {
      socket.emit('room-error', 'Room not found');
      return;
    }

    // TODO: Verify token ownership if tokenGate exists

    room.participants.add(data.userAddress);
    socket.join(data.roomId);

    io.to(data.roomId).emit('user-joined-room', {
      user: data.userAddress,
      participants: Array.from(room.participants)
    });

    socket.emit('room-joined', {
      room: {
        ...room,
        participants: Array.from(room.participants)
      }
    });

    console.log('User joined room:', data.userAddress, data.roomId);
  });

  // Leave room - DON'T delete room immediately
  socket.on('leave-room', (data: { roomId: string; userAddress: string }) => {
    const room = rooms.get(data.roomId);

    if (room) {
      room.participants.delete(data.userAddress);
      socket.leave(data.roomId);

      io.to(data.roomId).emit('user-left-room', {
        user: data.userAddress,
        participants: Array.from(room.participants)
      });

      console.log('User left room:', data.userAddress, data.roomId);

      // Only delete room if empty for more than 5 minutes
      if (room.participants.size === 0) {
        setTimeout(() => {
          const currentRoom = rooms.get(data.roomId);
          if (currentRoom && currentRoom.participants.size === 0) {
            rooms.delete(data.roomId);
            console.log('Room deleted after timeout:', data.roomId);
          }
        }, 5 * 60 * 1000); // 5 minutes
      }
    }
  });

  // Get room info
  socket.on('get-room', (roomId: string) => {
    const room = rooms.get(roomId);
    if (room) {
      socket.emit('room-info', {
        room: {
          ...room,
          participants: Array.from(room.participants)
        }
      });
    } else {
      socket.emit('room-error', 'Room not found');
    }
  });

  // Send message in room
  socket.on('send-room-message', (data: {
    roomId: string;
    from: string;
    text: string;
    timestamp: string;
  }) => {
    const room = rooms.get(data.roomId);

    if (room && room.participants.has(data.from)) {
      io.to(data.roomId).emit('receive-room-message', {
        from: data.from,
        text: data.text,
        timestamp: data.timestamp,
        id: Date.now().toString()
      });
    }
  });

  // Original direct message handling
  socket.on('send-message', (data: {
    to: string;
    from: string;
    text: string;
    timestamp: string;
  }) => {
    const recipientSocketId = connectedUsers.get(data.to);

    if (recipientSocketId) {
      io.to(recipientSocketId).emit('receive-message', {
        from: data.from,
        text: data.text,
        timestamp: data.timestamp,
        id: Date.now().toString()
      });
      socket.emit('message-sent', { success: true });
    } else {
      socket.emit('message-sent', { success: false, error: 'User offline' });
    }
  });

  socket.on('disconnect', () => {
    for (const [address, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(address);
        io.emit('user-offline', address);

        // Remove from all rooms but don't delete rooms
        rooms.forEach((room, roomId) => {
          if (room.participants.has(address)) {
            room.participants.delete(address);
            io.to(roomId).emit('user-left-room', {
              user: address,
              participants: Array.from(room.participants)
            });
          }
        });

        console.log('User disconnected:', address);
        break;
      }
    }
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
