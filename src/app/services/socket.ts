// src/app/services/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

const SOCKET_URL =
    process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";

export interface User {
  address: string;
  type: "GUEST" | "EVM" | "SUBSTRATE" | "WALLET";
  connectedAt?: Date;
}

export const getSocket = (): Socket => {
  if (!socket) {
    console.log("Creating new socket connection to", SOCKET_URL);

    socket = io(SOCKET_URL, {
      autoConnect: false,
    });

    // ---------- Base Connection Events ----------
    socket.on("connect", () => {
      console.log("🟢 Socket connected, ID:", socket?.id);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected");
    });

    socket.on("connect_error", (error) => {
      console.error("⚠️ Socket connection error:", error);
    });

    // ---------- Login Events ----------
    socket.on("loginSuccess", (user: User) => {
      console.log("✅ Login success:", user);
    });

    socket.on("loginError", (error: string) => {
      console.error("❌ Login error:", error);
    });

    // ---------- User List Updates ----------
    socket.on("userList", (list: User[]) => {
      console.log("👥 Active users:", list);
    });

    // ---------- Chat Messages ----------
    socket.on("message", (msg) => {
      console.log("💬 New message:", msg);
    });
  }

  return socket;
};

// ============================================================
// 🧩 LOGIN HELPERS
// ============================================================

export const loginGuest = (id: string) => {
  const s = getSocket();
  if (!s.connected) s.connect();
  console.log(`Logging in as guest: ${id}`);
  s.emit("guestLogin", { id });
};

export const loginWallet = (
    address: string,
    signature: string,
    type: "EVM" | "SUBSTRATE"
) => {
  const s = getSocket();
  if (!s.connected) s.connect();
  console.log(`Logging in as wallet (${type}): ${address}`);
  s.emit("walletLogin", { address, signature, type });
};

export const loginPolkadot = (address: string, signature: string) => {
  const s = getSocket();
  if (!s.connected) s.connect();
  console.log(`Logging in as Polkadot user: ${address}`);
  s.emit("login", { address, signature });
};

// ============================================================
// 🧩 GENERAL EMITTERS
// ============================================================

export const sendMessage = (text: string) => {
  const s = getSocket();
  if (!s.connected) {
    console.warn("Socket not connected; message not sent");
    return;
  }
  s.emit("message", text);
};

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
    console.log("🔌 Socket disconnected manually");
  }
};
