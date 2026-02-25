const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

function generateRoom(email1, email2) {
  return [email1, email2].sort().join("_");
}

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("joinPrivateChat", ({ sender, receiver }) => {
    const room = generateRoom(sender, receiver);
    socket.join(room);
    console.log(`📌 ${sender} joined room ${room}`);
  });

  socket.on("sendPrivateMessage", ({ sender, receiver, message }) => {
    const room = generateRoom(sender, receiver);

    io.to(room).emit("receivePrivateMessage", {
      sender,
      message,
    });
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

server.listen(4000, "0.0.0.0", () => {
  console.log("Server running on port 4000");
});
