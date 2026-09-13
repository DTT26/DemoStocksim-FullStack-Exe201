import http from 'http';
import app from './app';
// import { Server } from 'socket.io';

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

// Socket.IO Setup Placeholder
// const io = new Server(server, { cors: { origin: '*' } });
// io.on('connection', (socket) => { ... });

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
