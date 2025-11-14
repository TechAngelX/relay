// src/app/services/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

const SOCKET_URL =
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    "wss://server-proud-shadow-4342.fly.dev";

export const getSocket = () => {
  if (!socket) {
    const url = SOCKET_URL
        .replace("wss://", "https://")
        .replace("ws://", "http://");

    socket = io(url, {
      transports: ["websocket"],
      withCredentials: true,
      autoConnect: true,
      secure: true,
    });

    socket.on("connect_error", (err) => {
      console.error("Socket error:", err.message);
    });
  }

  return socket;
};
