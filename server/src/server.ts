// server/src/server.ts
import express from "express";
import { createServer as createHttpServer } from "http";
import { createServer as createHttpsServer } from "https";
import { readFileSync } from "fs";
import { resolve } from "path";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(express.json());
const allowedOrigins = [
  "https://relay.techangelx.com",
  "https://192.168.0.10:3001",
  "https://localhost:3001"
];
app.use(
    cors({
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    })
);
const useHttps =
    process.env.USE_HTTPS_SERVER === "true" || process.env.NODE_ENV !== "production";

let httpServer;
if (useHttps) {
  const sslPath = resolve(__dirname, "../../ssl");
  const httpsOptions = {
    key: readFileSync(`${sslPath}/localhost+3-key.pem`),
    cert: readFileSync(`${sslPath}/localhost+3.pem`),
  };
  httpServer = createHttpsServer(httpsOptions, app);
  console.log("Using HTTPS server");
} else {
  httpServer = createHttpServer(app);
  console.log("HTTP server behind external TLS termination");
}

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});
const users: Record<string, any> = {};
const addressToSocket: Record<string, string> = {};
io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.emit("socketId", socket.id);

  users[socket.id] = { socketId: socket.id };
  io.emit("userList", Object.values(users));

  socket.on("register", (address: string) => {
    addressToSocket[address] = socket.id;
    users[socket.id] = { socketId: socket.id, address };
    io.emit("userList", Object.values(users));
  });

  socket.on("send-message", (data) => {
    const targetSocketId = addressToSocket[data.to];
    if (targetSocketId) {
      io.to(targetSocketId).emit("receive-message", {
        ...data,
        id: data.id || `${Date.now()}-${Math.random()}`,
      });
    }
  });

  socket.on("webrtc-offer", (data) => {
    const targetSocketId = addressToSocket[data.to]; // Use address mapping
    if (targetSocketId) {
      io.to(targetSocketId).emit("webrtc-offer", data);
    }
  });

  socket.on("webrtc-answer", (data) => {
    const targetSocketId = addressToSocket[data.to]; // Use address mapping
    if (targetSocketId) {
      io.to(targetSocketId).emit("webrtc-answer", data);
    }
  });

  socket.on("webrtc-ice", (data) => {
    const targetSocketId = addressToSocket[data.to]; // Use address mapping
    if (targetSocketId) {
      io.to(targetSocketId).emit("webrtc-ice", data);
    }
  });

  socket.on("disconnect", () => {
    const user = users[socket.id];
    if (user?.address) {
      delete addressToSocket[user.address];
    }
    delete users[socket.id];
    io.emit("userList", Object.values(users));
    console.log("Disconnected:", socket.id);
  });
});

const PORT = parseInt(process.env.PORT || "3000");
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at port ${PORT}`);
});
