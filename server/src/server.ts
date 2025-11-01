import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { ethers } from "ethers";

const app = express();
app.use(express.json());

// Allow only your domains
const allowedOrigins = [
  "https://relay.techangelx.com", // production
  "http://localhost:3001"         // dev
];

app.use(
    cors({
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    })
);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const users: Record<string, any> = {};

// === SOCKET EVENTS ===
io.on("connection", (socket) => {
  console.log(`Connected: ${socket.id}`);

  // ------------------------------
  // Guest login
  // ------------------------------
  socket.on("guestLogin", ({ id }) => {
    if (!id) return socket.emit("loginError", "Invalid guest ID");
    users[socket.id] = { address: id, type: "GUEST", connectedAt: new Date() };
    console.log(`Guest joined: ${id}`);
    socket.emit("loginSuccess", users[socket.id]);
    io.emit("userList", Object.values(users));
  });

  // ------------------------------
  // Wallet login (EVM/Substrate)
  // ------------------------------
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
      console.log(`[${type}] ${address} connected`);
      socket.emit("loginSuccess", users[socket.id]);
      io.emit("userList", Object.values(users));
    } catch (err) {
      console.error("walletLogin error:", err);
      socket.emit("loginError", "Wallet login failed");
    }
  });

  // ------------------------------
  // Polkadot/Substrate login
  // ------------------------------
  socket.on("login", (data) => {
    if (!data.address) return socket.emit("loginError", "Missing address");
    users[socket.id] = {
      address: data.address,
      type: "SUBSTRATE",
      connectedAt: new Date(),
    };
    console.log(`[SUBSTRATE] ${data.address} connected`);
    socket.emit("loginSuccess", users[socket.id]);
    io.emit("userList", Object.values(users));
  });

  // ------------------------------
  // Register user
  // ------------------------------
  socket.on("register", (address) => {
    if (!address) return;
    users[socket.id] = { address, type: "REGISTERED", connectedAt: new Date() };
    console.log(`User registered: ${address}`);
    io.emit("userList", Object.values(users));
  });

  // ------------------------------
  // Send message with detailed logs
  // ------------------------------
  socket.on("send-message", (data) => {
    const sender = users[socket.id];
    if (!sender) {
      console.log("No sender found for socket:", socket.id);
      return;
    }

    const payload = {
      from: sender.address,
      to: data.to,
      text: data.text,
      timestamp: new Date(),
    };

    console.log("SEND-MESSAGE event:", payload);
    console.log("Current users map:", users);

    // Find the recipient by address
    const recipient = Object.entries(users).find(
        ([, u]) => u.address.trim() === data.to.trim()
    );

    if (recipient) {
      const [recipientSocketId, recipientUser] = recipient;
      console.log(`Delivering to socket ${recipientSocketId}:`, recipientUser);
      io.to(recipientSocketId).emit("receive-message", payload);
    } else {
      console.log(`Recipient ${data.to} not found or offline.`);
    }
  });

  // ------------------------------
  // Handle disconnections
  // ------------------------------
  socket.on("disconnect", () => {
    const user = users[socket.id];
    if (user) {
      console.log(`${user.address} disconnected`);
      delete users[socket.id];
      io.emit("userList", Object.values(users));
    }
  });
});

// === SERVER START ===
const PORT = parseInt(process.env.PORT || "3000", 10);
const HOST = "0.0.0.0";

httpServer.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
});
