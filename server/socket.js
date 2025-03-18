import { Server } from 'socket.io';

let io;
let onlineUsers = new Map(); // To track connected users

export const initializeSocket = (server) => {
    console.log('--------------- Socket initialized ---');
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            methods: ["GET", "POST"],
            credentials: true,
        }
    });

    io.on("connection", (socket) => {
        console.log("---------------  User connected:", socket.id);

        // Store userId when they connect
        socket.on("user-connected", (userId) => {
            console.log('-------------------------------------------');
            onlineUsers.set(userId, socket.id);
        });

        // Handle user disconnect
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
            for (let [key, value] of onlineUsers) {
                if (value === socket.id) {
                    onlineUsers.delete(key);
                }
            }
        });
    });

    console.log('--------------- Socket server is now listening for events ---');

    // Store io in the app object so it can be accessed in other parts of the app
    return io;
};

export { io };
