// src/app/services/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

const SOCKET_URL =
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    "https://server-proud-shadow-4342.fly.dev";

export interface User {
  address: string;
  type: "GUEST" | "EVM" | "SUBSTRATE" | "WALLET";
  connectedAt?: Date;
}

// ------------------------------------------------------------
// Initialize socket connection
// ------------------------------------------------------------
export const getSocket = (): Socket => {
  if (!socket) {
    console.log("Creating new socket connection to", SOCKET_URL);

    socket = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
      autoConnect: false,
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });

    socket.on("loginSuccess", (user: User) => {
      console.log("Login success:", user);
    });

    socket.on("loginError", (error: string) => {
      console.error("Login error:", error);
    });

    socket.on("userList", (list: User[]) => {
      console.log("Active users:", list);
    });

    socket.on("receive-message", (msg) => {
      console.log("Message received:", msg);
    });
  }

  return socket;
};

// ------------------------------------------------------------
// Login helpers
// ------------------------------------------------------------
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
  console.log(`Wallet login (${type}): ${address}`);
  s.emit("walletLogin", { address, signature, type });
};

export const loginPolkadot = (address: string, signature?: string) => {
  const s = getSocket();
  if (!s.connected) s.connect();
  console.log(`Polkadot login: ${address}`);
  s.emit("login", { address, signature });
};

// ------------------------------------------------------------
// General emitters
// ------------------------------------------------------------
export const registerUser = (address: string) => {
  const s = getSocket();
  if (!s.connected) s.connect();
  console.log(`Registering user: ${address}`);
  s.emit("register", address);
};

export const sendMessage = (to: string, text: string) => {
  const s = getSocket();
  if (!s.connected) s.connect();
  console.log(`Sending message to ${to}: ${text}`);
  s.emit("send-message", { to, text });
};

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
    console.log("Socket disconnected manually");
  }
};

// ------------------------------------------------------------
// Attach socket to window (for console testing)
// ------------------------------------------------------------
if (typeof window !== "undefined") {
  const s = getSocket();
  (window as any).socket = s;
  s.connect();
}
