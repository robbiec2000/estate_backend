import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import postRoute from "./routes/post.route.js";
import authRoute from "./routes/auth.routes.js";
import userRoute from "./routes/user.routes.js";
import chatRoute from "./routes/chat.route.js";
import messageRoute from "./routes/message.route.js";
import cookieParser from "cookie-parser";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
  },
});

let onlineUser = [];
const addUser = (userId, socketId) => {
  const userExist = onlineUser.find((user) => user.userId === userId);
  if (!userExist) {
    onlineUser.push({ userId, socketId });
  }
};
const removeUser = (socketId) => {
  onlineUser = onlineUser.filter((user) => user.socketId !== socketId);
};
const getUser = (userId) => {
  return onlineUser.find((user) => user.userId === userId);
};
io.on("connection", (socket) => {
  socket.on("newUser", (userId) => {
    addUser(userId, socket.id);
  });

  socket.on("sendMessage", ({ receiverId, data }) => {
    const receiver = getUser(receiverId);
    if (!receiver) return;
    io.to(receiver.socketId).emit("getMessage", data);
  });

  socket.on("disconnect", (userId) => {
    removeUser(userId);
  });
});

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/api/posts", postRoute);
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/chats", chatRoute);
app.use("/api/messages", messageRoute);

server.listen(8800, () => {
  console.log("server is running");
});
