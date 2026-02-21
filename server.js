let savedUser = {
  userEmail: null,
  FCMToken: null,
};
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  ),
});

const app = express();
app.use(cors({ origin: "*" }));
app.get("/", (req, res) => res.send("Socket server alive!"));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  pingTimeout: 60000,
});

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);
  socket.emit("welcome", { msg: "Connected!" });

  socket.on("registerUser", ({ email, fcmToken }) => {
    savedUser.userEmail = email;
    savedUser.FCMToken = fcmToken;

    console.log("✅ User registered:", email);
  });

  socket.on("joinRoom", (room) => {
    socket.join(room);
    console.log(`📱 Socket ${socket.id} joined room: ${room}`);
  });

  socket.on("sendMessage", async (data) => {
    console.log("💬 Message in room", data.room, ":", data.text);

    // 1️⃣ Real-time message
    io.to(data.room).emit("receiveMessage", data);

    // 2️⃣ Push notification
    try {
      if (savedUser.FCMToken && data.email !== savedUser.userEmail) {
        await admin.messaging().send({
          token: savedUser.FCMToken,
          notification: {
            title: `Message by ${data.user}`,
            body: data.text,
          },
        });

        console.log("✅ Push sent successfully");
      }
    } catch (error) {
      console.log("❌ Push error:", error);
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ User disconnected:", socket.id, "Reason:", reason);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Socket server on http://localhost:${PORT}`);
});
