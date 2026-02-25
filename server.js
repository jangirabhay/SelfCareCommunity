const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // 🔥 User joins their own email room
  socket.on("registerUser", (email) => {
    socket.join(email);
    socket.email = email; // store email in socket
    console.log(`📌 ${email} registered and joined personal room`);
  });

  // 🔥 Send private message
  socket.on("sendPrivateMessage", ({ receiver, message }) => {
    const sender = socket.email; // auto get sender

    if (!sender) {
      console.log("❌ Sender not registered");
      return;
    }

    console.log(`💬 ${sender} → ${receiver}: ${message}`);

    io.to(receiver).emit("receivePrivateMessage", {
      sender,
      message,
    });
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

server.listen(4000, "0.0.0.0", () => {
  console.log("🚀 Server running on port 4000");
});
