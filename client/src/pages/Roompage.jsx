import { useEffect, useState, useRef, useCallback } from "react";
import { useSocket } from "../context/SocketContext";
import { usePeer } from "../context/PeerContext";
import { useParams } from "react-router-dom";

export default function RoomPage() {
  const { roomCode } = useParams();
  const { socket } = useSocket();
  const { peer, createOffer, handleRemoteAnswer, addStream } = usePeer();
  const [usersInRoom, setUsersInRoom] = useState([]);
  const [streams, setStreams] = useState({});
  const localVideoRef = useRef();

  useEffect(() => {
    console.log(peer); // Check if peer is initialized properly
    if (!peer) return; // Ensure peer is initialized
    
    // Listen for remote streams
    peer.on("stream", (remoteStream) => {
      handleRemoteStream(remoteStream); 
    });
  
    return () => {
      peer.off("stream"); // Cleanup
    };
  }, [peer]);
  

  useEffect(() => {
    if (!socket) return; // Exit if socket is not initialized

    const initMedia = async () => {
      try {
        // Access media devices
        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream; // Set local video stream
        }
        addStream(localStream); // Add local stream to the peer connection

        const offer = await createOffer(); // Create an offer
        socket.emit("call-user", { offer, roomCode }); // Emit call to the user
      } catch (err) {
        console.error("Error accessing media devices:", err);
      }
    };

    initMedia(); // Initialize media
  }, [createOffer, addStream, socket, roomCode]);

  // Handle incoming call
  const handleIncomingCall = useCallback(async (data) => {
    const answer = await peer.createAnswer(data.offer); // Create answer
    await peer.setLocalDescription(answer); // Set local description
    socket.emit("call-answer", { answer, roomCode }); // Emit answer
  }, [peer, socket, roomCode]);

  // Handle remote answer
  const handleAnswer = useCallback((data) => {
    handleRemoteAnswer(data.answer);
  }, [handleRemoteAnswer]);

  // Handle remote stream
  const handleRemoteStream = (stream) => {
    setStreams((prevStreams) => ({
      ...prevStreams,
      [stream.username]: stream, // Add stream with username
    }));
  };

  useEffect(() => {
    if (!peer) return; // Ensure peer is initialized

    // Listen for remote streams
    peer.on("stream", (remoteStream) => {
      // Assuming remoteStream has a username property
      handleRemoteStream(remoteStream); 
    });

    return () => {
      peer.off("stream"); // Cleanup
    };
  }, [peer]);

  useEffect(() => {
    if (!socket) return; // Exit if socket is not initialized

    socket.on("incoming-call", handleIncomingCall); // Listen for incoming calls
    socket.on("call-answer", handleAnswer); // Listen for answers

    return () => {
      socket.off("incoming-call", handleIncomingCall); // Cleanup
      socket.off("call-answer", handleAnswer); // Cleanup
    };
  }, [socket, handleIncomingCall, handleAnswer]);

  return (
    <div>
      <h1>Room Page</h1>
      <p>Room Code: {roomCode}</p>
      
      <h2>Local Video:</h2>
      <video ref={localVideoRef} autoPlay muted style={{ width: "200px" }} />

      <h2>Users in Room:</h2>
      <ul>
        {usersInRoom.map((user) => (
          <li key={user}>{user}</li>
        ))}
      </ul>

      <h2>Remote Videos:</h2>
      {Object.entries(streams).map(([username, stream]) => (
        <div key={username}>
          <h4>{username}</h4>
          <video
            autoPlay
            ref={(video) => {
              if (video) {
                video.srcObject = stream; // Set remote video stream
              }
            }}
            style={{ width: "200px" }}
          />
        </div>
      ))}
    </div>
  );
}
