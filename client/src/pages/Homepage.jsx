import { useEffect, useState, useCallback } from "react";
import { useSocket } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";

export default function Homepage() {
  const navigate = useNavigate();
  const socket = useSocket();
  const [roomCode, setRoomCode] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const handleConnect = () => {
      console.log("Socket connected successfully");
      setIsConnected(true);
      setError("");
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected");
      setIsConnected(false);
      setError("Connection lost. Please try again.");
    };

    const handleError = (error) => {
      console.error("Socket error:", error);
      setError(error.message || "An error occurred");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("error", handleError);

    // Cleanup socket listeners on unmount
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("error", handleError);
    };
  }, [socket]);

  const handleJoinedRoom = useCallback((data) => {
    console.log("Room joined:", data);
    navigate(`/room/${data.roomCode}`);
  }, [navigate]);

  useEffect(() => {
    socket.on("joined_room", handleJoinedRoom);

    // Cleanup event listener when component unmounts
    return () => {
      socket.off("joined_room", handleJoinedRoom);
    };
  }, [socket, handleJoinedRoom]);

  const joinRoom = useCallback(() => {
    setError("");

    if (!roomCode.trim() || !username.trim()) {
      setError("Please enter both room code and username");
      return;
    }

    if (!isConnected) {
      setError("Not connected to server. Please wait...");
      return;
    }

    socket.emit("join_room", {
      roomCode: roomCode.trim(),
      username: username.trim(),
    });
  }, [roomCode, username, isConnected, socket]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === "Enter") {
      joinRoom();
    }
  }, [joinRoom]);

  return (
    <div className="homepage">
      <h1>Join a Room</h1>
      <div style={roomStyles} className="join-room-container">
        <input
          style={inputStyles}
          type="text"
          placeholder="Enter room code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          onKeyPress={handleKeyPress}
          maxLength={20}
        />
        <input
          style={inputStyles}
          type="text"
          placeholder="Enter your name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={handleKeyPress}
          maxLength={30}
        />
        {error && <p style={errorStyles}>{error}</p>}
        <button 
          onClick={joinRoom}
          disabled={!isConnected}
          style={buttonStyles}
        >
          Join Room
        </button>
        {!isConnected && (
          <p style={statusStyles}>Connecting to server...</p>
        )}
      </div>
    </div>
  );
}

const roomStyles = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "15px",
  padding: "20px",
  maxWidth: "400px",
  margin: "0 auto",
};

const inputStyles = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  width: "100%",
  fontSize: "16px",
};

const buttonStyles = {
  padding: "12px 24px",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "#007bff",
  color: "white",
  cursor: "pointer",
  fontSize: "16px",
  width: "100%",
};

const errorStyles = {
  color: "#dc3545",
  margin: "0",
  fontSize: "14px",
};

const statusStyles = {
  color: "#6c757d",
  margin: "0",
  fontSize: "14px",
};
