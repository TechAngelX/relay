// server/src/server.ts
import express from "express";
import { createServer as createHttpServer } from "http";
import { createServer as createHttpsServer } from "https";
import { readFileSync } from "fs";
import { resolve } from "path";
import { Server } from "socket.io";
import cors from "cors";
import { ethers } from "ethers";

const app = express();
app.use(express.json());

const allowedOrigins = [
  "https://relay.techangelx.com",
  "https://192.168.0.10:3001",
  "https://localhost:3001"
];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST"],
  credentials: true,
}));

// ✅ Check if we're in dev mode
const isDev = process.env.NODE_ENV !== "production";
let httpServer;

if (isDev) {
  // ✅ Path to SSL certs from server directory
  const sslPath = resolve(__dirname, "../../ssl");
  const httpsOptions = {
    key: readFileSync(`${sslPath}/localhost+3-key.pem`),
    cert: readFileSync(`${sslPath}/localhost+3.pem`),
  };
  httpServer = createHttpsServer(httpsOptions, app);
  console.log("🔒 Using HTTPS for local dev");
} else {
  httpServer = createHttpServer(app);
  console.log("🌐 Using HTTP (Fly.io handles SSL)");
}

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const users: Record<string, any> = {};

// === Existing socket logic ===
io.on("connection", (socket) => {
  console.log(`🟢 Connected: ${socket.id}`);

  socket.on("guestLogin", ({ id }) => {
    if (!id) return socket.emit("loginError", "Invalid guest ID");
    users[socket.id] = { address: id, type: "GUEST", connectedAt: new Date() };
    console.log(`👤 Guest joined: ${id}`);
    socket.emit("loginSuccess", users[socket.id]);
    io.emit("userList", Object.values(users));
  });

  socket.on("walletLogin", async ({ address, signature, type }) => {
    try {
      if (!address || !signature)
        return socket.emit("loginError", "Missing address or signature");

      if (type === "EVM") {
        const msg = "Login to Relay";
        const recovered = ethers.verifyMessage(msg, signature);
        if (recovered.toLowerCase() !== address.toLowerCase())
          return socket.emit("loginError", "Invalid signature");
      }

      users[socket.id] = { address, type, connectedAt: new Date() };
      console.log(`💳 [${type}] ${address} connected`);
      socket.emit("loginSuccess", users[socket.id]);
      io.emit("userList", Object.values(users));
    } catch (err) {
      console.error("walletLogin error:", err);
      socket.emit("loginError", "Wallet login failed");
    }
  });

  socket.on("login", (data) => {
    if (!data.address) return socket.emit("loginError", "Missing address");
    users[socket.id] = {
      address: data.address,
      type: "SUBSTRATE",
      connectedAt: new Date(),
    };
    console.log(`🔗 [SUBSTRATE] ${data.address} connected`);
    socket.emit("loginSuccess", users[socket.id]);
    io.emit("userList", Object.values(users));
  });

  socket.on("message", (msg) => {
    const user = users[socket.id];
    if (!user) return;
    const payload = {
      from: user.address,
      type: user.type,
      text: msg,
      timestamp: new Date(),
    };
    io.emit("message", payload);
  });

  socket.on("disconnect", () => {
    const user = users[socket.id];
    if (user) {
      console.log(`🔴 ${user.address} disconnected`);
      delete users[socket.id];
      io.emit("userList", Object.values(users));
    }
  });
});

const PORT = parseInt(process.env.PORT || "3000", 10);
const HOST = "0.0.0.0";

httpServer.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on ${isDev ? 'https' : 'http'}://${HOST}:${PORT}`);
});
