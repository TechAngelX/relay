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

const connectedUsers = new Map<string, string>(); 

interface MessageData {
  to: string;
  from: string;
  text: string;
  timestamp: string;
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('register', (address: string) => {
    connectedUsers.set(address, socket.id);
    io.emit('user-online', address);
  });

  socket.on('send-message', (data: MessageData) => {
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
        break;
      }
    }
  });
});

const PORT = 5001;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
