import 'dotenv/config';
import http from 'http';
import mongoose from 'mongoose';
import app from './app';
import dotenv from 'dotenv';
import Wallet from './models/Wallet';

dotenv.config();
// import { Server } from 'socket.io';

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/stocksim';

const server = http.createServer(app);

// Socket.IO Setup Placeholder
// const io = new Server(server, { cors: { origin: '*' } });
// io.on('connection', (socket) => { ... });

const MONGO_URI_LOCAL = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/stocksim';

mongoose.connect(MONGO_URI_LOCAL)
  .then(async () => {
    console.log('✅ Connected to MongoDB');

    // Tạo sẵn Ví cho DUMMY_USER_ID để test Frontend
    const DUMMY_USER_ID = '64f7b1e4a3b9c2d1e8f9a0b1';
    const existingWallet = await Wallet.findOne({ userId: DUMMY_USER_ID });
    if (!existingWallet) {
      await Wallet.create({
        userId: DUMMY_USER_ID,
        balance: 100000000,
        availableBalance: 100000000
      });
      console.log('✅ Created Dummy Wallet for testing');
    }

    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
  });
