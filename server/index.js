const express = require("express");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const io = new Server({ cors: true });

// Middleware
app.use(bodyParser.json());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
}));

// Maps for managing socket-username associations
const emailToSocketMapping = new Map();
const socketToEmailMapping = new Map();

io.listen(8080, () => {
  console.log("Socket.IO server running on http://localhost:8080");
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join_room", async ({ roomCode, username }) => {
    console.log(`${username} joined room: ${roomCode}`);

    // Remove any previous mappings for this username
    if (emailToSocketMapping.has(username)) {
      const oldSocketId = emailToSocketMapping.get(username);
      socket.to(oldSocketId).disconnect();
    }

    // Store socket ID and join room
    emailToSocketMapping.set(username, socket.id);
    socketToEmailMapping.set(socket.id, username);
    socket.join(roomCode);

    socket.emit("joined_room", { username, roomCode });
    socket.broadcast.to(roomCode).emit("user_joined", {
      username,
      roomCode,
      message: `${username} has joined the room.`,
    });

    // Handle initiating a call to another user
    socket.on("call-user", ({ offer, to }) => {
      const fromUsername = socketToEmailMapping.get(socket.id);
      const toSocketId = emailToSocketMapping.get(to);
      if (toSocketId) {
        socket.to(toSocketId).emit("incoming-call", {
          offer,
          from: fromUsername,
        });
      }
    });

    // Handle answering a call
    socket.on("call-answer", ({ answer, to }) => {
      const toSocketId = emailToSocketMapping.get(to);
      if (toSocketId) {
        socket.to(toSocketId).emit("call-answer", {
          answer,
          from: socketToEmailMapping.get(socket.id),
        });
      }
    });
  });

  socket.on("disconnect", () => {
    const username = socketToEmailMapping.get(socket.id);
    console.log(`User disconnected: ${socket.id} (${username})`);
    
    // Clean up mappings
    if (username) emailToSocketMapping.delete(username);
    socketToEmailMapping.delete(socket.id);
  });
});

// Express API endpoints
app.get("/", (req, res) => {
  res.json("Hello World");
});

app.listen(3000, () => {
  console.log("Express server running on http://localhost:3000");
});
