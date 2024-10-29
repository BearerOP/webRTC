import { useEffect, useState, useCallback } from "react";
import { useSocket } from "../context/SocketContext";
import { useParams } from "react-router-dom";
import { usePeer } from "../context/PeerContext";

export default function RoomPage() {
  const { roomCode } = useParams();
  const { socket } = useSocket();
  const [usersInRoom, setUsersInRoom] = useState([]);
  const { peer, createOffer, handleRemoteAnswer } = usePeer();

  // Handle when a new user joins the room
  const handleUserJoined = useCallback(async (data) => {
    console.log(`${data.username} joined room: ${data.roomCode}`);
    setUsersInRoom((prevUsers) => [...prevUsers, data.username]);
    
    const offer = await createOffer(peer);
    socket.emit("call-user", {
      offer,
      to: data.username,
    });
  }, [peer, createOffer, socket]);

  // Handle incoming call offer
  const handleIncomingCall = useCallback(async (data) => {
    console.log(`Incoming call from ${data.from}`);
    const answer = await peer.createAnswer(data.offer);
    await peer.setLocalDescription(answer);
    
    socket.emit("call-answer", {
      to: data.from,
      answer,
    });
  }, [peer, socket]);

  // Handle incoming call answer
  const handleAnswer = useCallback((data) => {
    console.log(`Answer received from ${data.from}`);
    handleRemoteAnswer(data.answer);
  }, [handleRemoteAnswer]);

  useEffect(() => {
    if (socket) {
      socket.on("joined_room", handleUserJoined);
      socket.on("user_joined", handleUserJoined);
      socket.on("incoming-call", handleIncomingCall);
      socket.on("call-answer", handleAnswer);

      return () => {
        socket.off("joined_room", handleUserJoined);
        socket.off("user_joined", handleUserJoined);
        socket.off("incoming-call", handleIncomingCall);
        socket.off("call-answer", handleAnswer);
      };
    }
  }, [socket, handleUserJoined, handleIncomingCall, handleAnswer]);

  return (
    <div>
      <h1>Room Page</h1>
      <p>Room Code: {roomCode}</p>
      <h2>Users in Room:</h2>
      <ul>
        {usersInRoom.map((user, index) => (
          <li key={index}>{user}</li>
        ))}
      </ul>
    </div>
  );
}
