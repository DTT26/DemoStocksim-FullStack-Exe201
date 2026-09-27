import 'dotenv/config';
import http from 'http';
import mongoose from 'mongoose';
import app from './app';
import dotenv from 'dotenv';
import Wallet from './models/Wallet';

dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/stocksim';

const server = http.createServer(app);

const MONGO_URI_LOCAL = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/stocksim';

mongoose.connect(MONGO_URI_LOCAL)
  .then(async () => {
    console.log('✅ Connected to MongoDB');

    // Tự động dọn dẹp các dữ liệu mock/seed cũ nếu còn sót lại trong MongoDB
    try {
      const Simulation = (await import('./models/Simulation')).default;
      const Assignment = (await import('./models/Assignment')).default;
      const User = (await import('./models/User')).default;

      await Simulation.deleteMany({ name: 'Vietnam Stock Challenge #01' });
      await Assignment.deleteMany({
        title: { $in: ['Technical Analysis: FPT', 'Risk Management Strategy: VN30'] }
      });
      await User.deleteMany({ email: 'lecturer@stocksim.edu.vn' });
      await Wallet.deleteMany({ userId: '64f7b1e4a3b9c2d1e8f9a0b1' });
    } catch (cleanupErr) {
      console.warn('Cleanup mock data notice:', cleanupErr);
    }

    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
  });
