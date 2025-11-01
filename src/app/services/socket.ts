// src/app/services/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

// ✅ Use secure Fly.io URL by default
const SOCKET_URL =
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    "https://server-proud-shadow-4342.fly.dev";

export interface User {
  address: string;
  type: "GUEST" | "EVM" | "SUBSTRATE" | "WALLET";
  connectedAt?: Date;
}

export const getSocket = (): Socket => {
  if (!socket) {
    console.log("🧩 Creating new socket connection to", SOCKET_URL);

    // ✅ Always use WebSocket transport (avoid xhr-polling & CORS)
    socket = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
      autoConnect: false,
    });

    // ---------- Base Connection Events ----------
    socket.on("connect", () => {
      console.log("🟢 Socket connected:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔴 Socket disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("⚠️ Socket connection error:", error.message);
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
      console.log("💬 Message received:", msg);
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
  console.log(`👤 Logging in as guest: ${id}`);
  s.emit("guestLogin", { id });
};

export const loginWallet = (
    address: string,
    signature: string,
    type: "EVM" | "SUBSTRATE"
) => {
  const s = getSocket();
  if (!s.connected) s.connect();
  console.log(`💳 Wallet login (${type}): ${address}`);
  s.emit("walletLogin", { address, signature, type });
};

export const loginPolkadot = (address: string, signature?: string) => {
  const s = getSocket();
  if (!s.connected) s.connect();
  console.log(`🔗 Polkadot login: ${address}`);
  s.emit("login", { address, signature });
};

// ============================================================
// 🧩 GENERAL EMITTERS
// ============================================================

export const sendMessage = (text: string) => {
  const s = getSocket();
  if (!s.connected) {
    console.warn("⚠️ Socket not connected — message not sent");
    return;
  }
  console.log(`📤 Sending message: ${text}`);
  s.emit("message", text);
};

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
    console.log("🔌 Socket disconnected manually");
  }
  if (typeof window !== "undefined") {
    (window as any).socket = getSocket();
  }

};
