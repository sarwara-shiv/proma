import React, { createContext, useEffect, useState, useContext, ReactNode } from 'react';
import { Socket, io } from 'socket.io-client';

// Define the shape of the context
interface SocketContextType {
  socket: Socket | null;
}

// Create the context with a default value of `null`
const SocketContext = createContext<SocketContextType>({ socket: null });

// Socket Provider Component
export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const API_URL = process.env.REACT_APP_API_URL;
    console.log("Socket API URL:", API_URL); // Debugging line

    if (!API_URL) {
      console.error("REACT_APP_API_URL is not defined in the environment variables.");
      return;
    }

    // Initialize the socket connection
    const socketInstance = io(API_URL, {
      withCredentials: true,
      transports: ["websocket"],
    });

    // Log socket connection events
    socketInstance.on("connect", () => {
      console.log("✅ Connected to socket server:", socketInstance.id);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("❌ Disconnected from socket server:", reason);
    });
    socketInstance.on("user-connected", () => {
      console.log("✅ user connected");
    });

    // Set the socket instance in state
    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use socket
export const useSocket = (): Socket | null => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context.socket;
};