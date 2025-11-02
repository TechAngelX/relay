// server/src/server.ts

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { ethers } from "ethers";

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// ===================================================================
// Address normalization + socket tracking
// ===================================================================
interface UserSocket {
  address: string;
  type: string;
  connectedAt: Date;
}

const usersBySocket: Record<string, UserSocket> = {};
const socketsByAddress: Map<string, Set<string>> = new Map();

const addrKey = (a?: string) => a?.toLowerCase().trim() || "";

const bindSocketToAddress = (socketId: string, address: string, type: string) => {
  const key = addrKey(address);
  usersBySocket[socketId] = { address, type, connectedAt: new Date() };

  if (!socketsByAddress.has(key)) socketsByAddress.set(key, new Set());
  socketsByAddress.get(key)!.add(socketId);
};

const unbindSocket = (socketId: string) => {
  const user = usersBySocket[socketId];
  if (user) {
    const key = addrKey(user.address);
    const set = socketsByAddress.get(key);
    if (set) {
      set.delete(socketId);
      if (set.size === 0) socketsByAddress.delete(key);
    }
    delete usersBySocket[socketId];
  }
};

const currentUsersList = () =>
    Array.from(new Set(Object.values(usersBySocket).map((u) => u.address)));

// ===================================================================
// SOCKET.IO CONNECTION HANDLERS
// ===================================================================
io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  // -------------------------------
  // Guest login
  // -------------------------------
  socket.on("guestLogin", ({ id }: { id: string }) => {
    if (!id) return socket.emit("loginError", "Invalid guest ID");
    bindSocketToAddress(socket.id, id, "GUEST");
    console.log(`Guest joined: ${id}`);
    socket.emit("loginSuccess", usersBySocket[socket.id]);
    io.emit("userList", currentUsersList());
  });

  // -------------------------------
  // Wallet login (EVM or substrate)
  // -------------------------------
  socket.on("walletLogin", async ({ address, signature, type }: { address: string; signature: string; type: string }) => {
    try {
      if (!address || !signature)
        return socket.emit("loginError", "Missing address or signature");

      if (type === "EVM") {
        const msg = "Login to Relay";
        const recovered = ethers.verifyMessage(msg, signature);
        if (recovered.toLowerCase() !== address.toLowerCase())
          return socket.emit("loginError", "Invalid signature");
      }

      bindSocketToAddress(socket.id, address, type || "WALLET");
      console.log(`[${type}] ${address} connected`);
      socket.emit("loginSuccess", usersBySocket[socket.id]);
      io.emit("userList", currentUsersList());
    } catch (err) {
      console.error("walletLogin error:", err);
      socket.emit("loginError", "Wallet login failed");
    }
  });

  // -------------------------------
  // Generic connected wallet re-login (for client re-use)
  // This event is now expected to be used by connected clients for quick re-binding.
  // It relies on the client passing the *correct, canonical address* (EVM hex in your flow).
  // -------------------------------
  socket.on("login", (data: { address: string; type?: string }) => {
    if (!data?.address) return socket.emit("loginError", "Missing address");
    // CRITICAL FIX: The client passes the EVM address, so we mark it as EVM
    // to ensure it maps to the same address key as the initial registration.
    // We assume that the initial WalletConnect performed the full address conversion.
    bindSocketToAddress(socket.id, data.address, data.type || "EVM_RECONNECT");
    console.log(`[EVM_RECONNECT] ${data.address} connected (re-login)`);
    socket.emit("loginSuccess", usersBySocket[socket.id]);
    io.emit("userList", currentUsersList());
  });

  // -------------------------------
  // Registration complete (Client Side Only - for consistency)
  // This event is not strictly needed on the server anymore but keeping it
  // for now based on original code logic, but pointing it to the generic login.
  // -------------------------------
  socket.on("register", (address: string) => {
    if (!address) return;
    bindSocketToAddress(socket.id, address, "REGISTERED");
    console.log(`User registered: ${address}`);
    io.emit("userList", currentUsersList());
  });

  // -------------------------------
  // Message handling
  // -------------------------------
  socket.on("send-message", (data: { to: string; text: string }) => {
    const sender = usersBySocket[socket.id];
    if (!sender) {
      console.log("No sender found for socket:", socket.id);
      return;
    }

    const payload = {
      id: Date.now().toString(),
      from: sender.address,
      to: data.to,
      text: data.text,
      timestamp: new Date(),
    };

    console.log("SEND-MESSAGE event:", payload);
    console.log("Current addresses online:", Array.from(socketsByAddress.keys()));

    const toKey = addrKey(data.to);
    const recipients = socketsByAddress.get(toKey);

    if (recipients && recipients.size > 0) {
      for (const sid of recipients) {
        io.to(sid).emit("receive-message", payload);
      }

      // echo back to sender's other devices/tabs
      const senderSockets = socketsByAddress.get(addrKey(sender.address)) || new Set();
      for (const sid of senderSockets) {
        io.to(sid).emit("receive-message", payload);
      }

      console.log(`Delivered to ${recipients.size} socket(s) for ${data.to}`);
    } else {
      console.log(`Recipient ${data.to} not found or offline.`);
    }
  });

  // -------------------------------
  // Disconnect
  // -------------------------------
  socket.on("disconnect", () => {
    const user = usersBySocket[socket.id];
    if (user) console.log(`${user.address} disconnected`);
    unbindSocket(socket.id);
    io.emit("userList", currentUsersList());
  });
});

// ===================================================================
// Server listen
// ===================================================================
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(` Relay server running on port ${PORT}`);
});
