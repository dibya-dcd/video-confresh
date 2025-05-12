const express=require("express");
const cors=require("cors");
const { createServer }=require("node:http");
const { Server }=require("socket.io");

const app=express();
const server=createServer(app);
const io =new Server(server ,{
    cors: { 
        origin: "http://localhost:5173", // Allow frontend origin
        methods: ["GET", "POST"]
      }
    });

// Socket.io signaling logic
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join room
  socket.on("join-room", (roomID) => {
    socket.join(roomID);
    console.log(`User ${socket.id} joined room ${roomID}`);
    socket.to(roomID).emit("user-joined", socket.id);
  });

  // Handle sending signals
  socket.on("sending-signal", (data) => {
    io.to(data.userToSignal).emit("user-signal", {
      signal: data.signal,
      callerID: data.callerID,
    });
  });

  // Return signal back
  socket.on("returning-signal", (data) => {
    io.to(data.callerID).emit("receiving-returned-signal", {
      signal: data.signal,
      id: socket.id,
    });
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(5000,()=>{
    console.log("Server is listening at port 5000");
});