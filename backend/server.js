const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const crypto = require('crypto');
const path = require('path');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// rooms: roomId -> { sockets: Set, users: Map<socketId, username> }
const rooms = new Map();

// Create room — server only tracks the ID, never the key
app.post('/api/create', (req, res) => {
  const roomId = crypto.randomBytes(5).toString('hex'); // 10-char id
  rooms.set(roomId, { sockets: new Set(), users: new Map() });
  res.json({ roomId });
});

io.on('connection', (socket) => {
  let roomId = null;
  let username = null;

  socket.on('join', ({ roomId: id, username: name }) => {
    if (!rooms.has(id)) {
      socket.emit('error', 'Room not found or expired.');
      return;
    }

    roomId = id;
    username = name;

    const room = rooms.get(roomId);
    room.sockets.add(socket.id);
    room.users.set(socket.id, username);
    socket.join(roomId);

    const userList = [...room.users.values()];
    socket.emit('joined', { userList });
    socket.to(roomId).emit('userJoined', { username, userList });
  });

  // Server only relays the encrypted blob — it cannot read the message
  socket.on('message', ({ encrypted, iv }) => {
    if (!roomId || !username) return;
    socket.to(roomId).emit('message', {
      from: username,
      encrypted,
      iv,
      ts: Date.now()
    });
  });

  socket.on('disconnect', () => {
    if (!roomId || !rooms.has(roomId)) return;

    const room = rooms.get(roomId);
    room.sockets.delete(socket.id);
    room.users.delete(socket.id);

    if (room.sockets.size === 0) {
      rooms.delete(roomId); // Room gone when everyone leaves
    } else {
      const userList = [...room.users.values()];
      io.to(roomId).emit('userLeft', { username, userList });
    }
  });
});

httpServer.listen(PORT, () => console.log(`Running on http://localhost:${PORT}`));
