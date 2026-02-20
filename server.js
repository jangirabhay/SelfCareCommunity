const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*' })); 
app.get('/', (req, res) => res.send('Socket server alive!')); 

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  pingTimeout: 60000 
});

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);
  socket.emit('welcome', { msg: 'Connected!' }); 

  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`📱 Socket ${socket.id} joined room: ${room}`);
  });

  socket.on('sendMessage', (data) => {
    console.log('💬 Message in room', data.room, ':', data.text);
    io.to(data.room).emit('receiveMessage', data);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ User disconnected:', socket.id, 'Reason:', reason);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Socket server on http://localhost:${PORT}`);
});
