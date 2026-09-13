import 'dotenv/config';
import http from 'http';
import mongoose from 'mongoose';
import app from './app';
// import { Server } from 'socket.io';

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/stocksim';

const server = http.createServer(app);

// Socket.IO Setup Placeholder
// const io = new Server(server, { cors: { origin: '*' } });
// io.on('connection', (socket) => { ... });

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });
