// server/socket.js
import { Server } from "socket.io";
import { ethers } from "ethers";

export default function setupSocket(server) {
    const io = new Server(server, { cors: { origin: "*" } });
    const users = {};

    io.on("connection", (socket) => {
        console.log(`🟢 Connected: ${socket.id}`);

        // ---------- GUEST LOGIN ----------
        socket.on("guestLogin", ({ id }) => {
            if (!id) return socket.emit("loginError", "Invalid guest ID");
            users[socket.id] = { address: id, type: "GUEST", connectedAt: new Date() };
            console.log(`👤 Guest joined: ${id}`);
            socket.emit("loginSuccess", users[socket.id]);
            io.emit("userList", Object.values(users));
        });

        // ---------- WALLET LOGIN (EVM / SUBSTRATE) ----------
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

        // ---------- POLKADOT LOGIN (existing flow) ----------
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

        // ---------- CHAT MESSAGES ----------
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

        // ---------- DISCONNECT ----------
        socket.on("disconnect", () => {
            const user = users[socket.id];
            if (user) {
                console.log(`🔴 ${user.address} disconnected`);
                delete users[socket.id];
                io.emit("userList", Object.values(users));
            }
        });
    });
}
