// server/src/server.ts

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

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

// Store connected users
const connectedUsers = new Map<string, string>(); // address -> socketId

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User registers with their Polkadot address
  socket.on('register', (address: string) => {
    connectedUsers.set(address, socket.id);
    console.log('User registered:', address);
    
    // Broadcast online status
    io.emit('user-online', address);
  });

  // Send message to specific user
  socket.on('send-message', (data: {
    to: string;
    from: string;
    text: string;
    timestamp: string;
  }) => {
    const recipientSocketId = connectedUsers.get(data.to);
    
    if (recipientSocketId) {
      // Send to recipient
      io.to(recipientSocketId).emit('receive-message', {
        from: data.from,
        text: data.text,
        timestamp: data.timestamp,
        id: Date.now().toString()
      });
      
      // Confirm to sender
      socket.emit('message-sent', { success: true });
    } else {
      socket.emit('message-sent', { success: false, error: 'User offline' });
    }
  });

  socket.on('disconnect', () => {
    // Find and remove user
    for (const [address, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(address);
        io.emit('user-offline', address);
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
