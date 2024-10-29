import { createContext, useContext, useMemo, useEffect } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context.socket;
};

export const SocketProvider = ({ children }) => {
  const socket = useMemo(() => {
    const socketInstance = io("http://localhost:8080", {
      transports: ["websocket"], // Optional: Force WebSocket transport if needed
    });

    // Log connection status
    socketInstance.on("connect", () => {
      console.log("Connected to Socket.IO server");
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Connection error:", err);
    });

    return socketInstance; // Return the socket instance itself
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      socket.disconnect(); // Disconnect when the provider unmounts
      console.log("Disconnected from Socket.IO server");
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
