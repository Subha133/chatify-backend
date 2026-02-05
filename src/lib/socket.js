import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";


const app = express();
const server = http.createServer(app);
const io = new Server(server,{
   cors: {
  origin: [
    'https://chatifyfrontend-five.vercel.app',
    'https://chatify-web-pi.vercel.app',
    'chatify-frontend-theta.vercel.app'
  ],
  credentials: true,
},
});

io.use(socketAuthMiddleware);

// we will use this function to check if the user is online or not
export function getReceiverSocketId(userId) {
  const socketIds = userSocketMap[userId];
  if (!socketIds || socketIds.size === 0) return null;
  return Array.from(socketIds);  // Returns array of socket IDs
}

const userSocketMap = {};

io.on("connection", (socket) => {
  const userId = socket.userId;
  console.log(`User connected: ${userId} (socket ID: ${socket.id})`);

  if (!userSocketMap[userId]) {
    userSocketMap[userId] = new Set();
  }
  userSocketMap[userId].add(socket.id);

  console.log("Current online users:", Object.keys(userSocketMap));
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${userId} (socket ID: ${socket.id})`);
    
    if (userSocketMap[userId]) {
      userSocketMap[userId].delete(socket.id);
      if (userSocketMap[userId].size === 0) {
        delete userSocketMap[userId];
        console.log(`User ${userId} fully offline`);
      }
    }

    console.log("Updated online users:", Object.keys(userSocketMap));
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});


export { io, app, server };

