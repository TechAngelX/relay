// server/src/server.ts
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);

const allowedOrigins = [
  'http://localhost:5173',
  'https://relay.techangelx.com',
  'https://server-proud-shadow-4342.fly.dev'
];

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

const connectedUsers = new Map<string, string>();

interface MessageData {
  to: string;
  from: string;
  text: string;
  timestamp: string;
}

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('register', (address: string) => {
    connectedUsers.set(address, socket.id);
    console.log(`User registered - Address: ${address}, Socket: ${socket.id}`);
    console.log(`Total users connected: ${connectedUsers.size}`);
    io.emit('user-online', address);
  });

  socket.on('send-message', (data: MessageData) => {
    console.log(`Message from ${data.from.slice(0, 10)}... to ${data.to.slice(0, 10)}...`);
    const recipientSocketId = connectedUsers.get(data.to);

    if (recipientSocketId) {
      io.to(recipientSocketId).emit('receive-message', {
        from: data.from,
        text: data.text,
        timestamp: data.timestamp,
        id: Date.now().toString()
      });
      socket.emit('message-sent', { success: true });
      console.log('Message delivered successfully');
    } else {
      socket.emit('message-sent', { success: false, error: 'User offline' });
      console.log('Message failed: recipient offline');
    }
  });

  socket.on('disconnect', () => {
    for (const [address, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(address);
        console.log(`User disconnected - Address: ${address}, Socket: ${socket.id}`);
        console.log(`Total users connected: ${connectedUsers.size}`);
        io.emit('user-offline', address);
        break;
      }
    }
  });
});

const PORT = parseInt(process.env.PORT || '5001', 10);
const HOST = '0.0.0.0';
httpServer.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
});
