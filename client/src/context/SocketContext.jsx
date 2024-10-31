import { createContext, useContext, useMemo, useEffect } from "react";
import { io } from "socket.io-client";

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
      transports: ["websocket", "polling"], // Adding fallback to polling
      reconnectionAttempts: 5,               // Retry up to 5 times
  });
  

    // Log connection status
    socketInstance.on("connect", () => {
      console.log("Connected to Socket.IO server");
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Connection error:", err);
    });

    return socketInstance;
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
