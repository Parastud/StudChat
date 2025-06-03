const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const axios = require('axios');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
let user = 0;
app.use(express.static('public'));
app.use(cors());
const activeRooms = new Map();

io.use(async (socket, next) => {
  const { address, headers, query } = socket.handshake;
  const ipAddress = address;

  try {
    const ipinfoToken = process.env.IPINFO_TOKEN || '2f9d8d518083c6';
    const response = await axios.get(`https://ipinfo.io/${ipAddress}?token=${ipinfoToken}`);
    const { city, region, country, org } = response.data;

    console.log(`User connected with IP: ${ipAddress}`);
    console.log(`City: ${city}`);
    console.log(`Region: ${region}`);
    console.log(`Country: ${country}`);
    console.log(`Organization: ${org || 'N/A'}`);
    console.log(`User-Agent: ${headers['user-agent']}`);
    console.log(`Query parameters:`, query);

    next();
  } catch (error) {
    console.error('Error fetching IPinfo data:', error.message);
    next();
  }
});

io.on('connection', (socket) => {
  user += 1;
  console.log('A user connected total: ' + user);

  socket.on('joinRoom', ({ username, room }) => {
    if (activeRooms.has(room)) {
      socket.join(room);
      console.log(`${username} joined room ${room}`);
      socket.to(room).emit('new', {message: `${username} has joined the room.` });
      socket.data = { username, room }
    } else {
      socket.emit('roomNotExist', room);
    }
  });

  socket.on('createRoom', () => {
    const randomRoom = generateRandomRoom();
    activeRooms.set(randomRoom, Date.now());
    socket.join(randomRoom);
    console.log('Created room:', randomRoom);
    socket.emit('createdRoom', randomRoom);
  });

  socket.on('chatMessage', (data) => {
    io.to(data.room).emit('message', data);
    activeRooms.set(data.room, Date.now()); 
  });

  socket.on('checkRoomExistence', ({ room }, callback) => {
    callback(activeRooms.has(room));
  });

  socket.on('disconnect', () => {
    user -= 1;
    if (socket.data.username == undefined){
      socket.data.username = "Not Found"
    }
    console.log(socket.data.username+' disconnected total: '+user);
    if (socket.data && socket.data.username && socket.data.room) {
      io.to(socket.data.room).emit('new', { message: `${socket.data.username} Left.` });
    }
  });
});

function deleteInactiveRooms() {
  const currentTime = Date.now();

  for (const [room, lastActivity] of activeRooms.entries()) {
    const inactiveDuration = currentTime - lastActivity;
    if (inactiveDuration > 600000) {
      console.log(`Deleting room ${room} as it is inactive for 10 minutes.`);
      io.to(room).emit('roomdel', {message: `Admin: This room is Inactive for so Long... Keep texting to avoid deletion`});
      activeRooms.delete(room);
    }
  }
}

setInterval(deleteInactiveRooms, 20); 

function generateRandomRoom() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';

  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }

  return result;
}

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

server.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
