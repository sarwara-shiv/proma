import { Server as socketIo } from 'socket.io';

let io;
let onlineUsers = new Map();

export const initializeSocket = (server, app) => {
    io = new socketIo(server, {
        transports: ["websocket"],
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    app.set("socket", io); // Store socket instance in Express app

    io.on("connection", (socket) => {
        console.log("✅ User connected:", socket.id); // Log connection to check

        // Debugging: Log every incoming event
        socket.onAny((event, ...args) => {
            console.log(`🛑 Received event: ${event} with data:`, args);
        });

        socket.on("user-connected", (userId) => {
            console.log("🎉 Received 'user-connected' event for userId:", userId);

            onlineUsers.set(userId, socket.id);
            console.log("📌 Online Users Map:", onlineUsers);
        });

        socket.on("user-disconnected", () => {
            console.log("❌ User disconnected:", socket.id);
            for (let [key, value] of onlineUsers) {
                if (value === socket.id) {
                    onlineUsers.delete(key);
                }
            }
            console.log("📌 Online Users After Disconnect:", onlineUsers);
        });
    });

    console.log("🚀 Socket server initialized");
    return io;
};

export { io, onlineUsers };