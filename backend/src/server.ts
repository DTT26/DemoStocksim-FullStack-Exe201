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

    // Tạo sẵn Ví cho DUMMY_USER_ID để test Frontend
    const DUMMY_USER_ID = '64f7b1e4a3b9c2d1e8f9a0b1';
    const existingWallet = await Wallet.findOne({ userId: DUMMY_USER_ID });
    if (!existingWallet) {
      await Wallet.create({
        userId: DUMMY_USER_ID,
        balance: 10000,
        availableBalance: 10000
      });
      console.log('✅ Created Dummy Wallet for testing');
    }

    // Auto-seed Simulation and Assignments if none exist
    try {
      const Simulation = (await import('./models/Simulation')).default;
      const Assignment = (await import('./models/Assignment')).default;
      const User = (await import('./models/User')).default;

      let defaultLecturer = await User.findOne({ role: 'lecturer' });
      if (!defaultLecturer) {
        defaultLecturer = await User.findOne({});
      }
      if (!defaultLecturer) {
        defaultLecturer = await User.create({
          email: 'lecturer@stocksim.edu.vn',
          name: 'TS. Nguyễn Văn A',
          role: 'lecturer',
          status: 'ACTIVE'
        });
      }

      let sim = await Simulation.findOne({});
      if (!sim) {
        sim = await Simulation.create({
          name: 'Vietnam Stock Challenge #01',
          description: 'Mô phỏng giao dịch các mã cổ phiếu hàng đầu thị trường chứng khoán Việt Nam',
          initialBalance: 100000000,
          market: 'HOSE',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'ACTIVE',
          createdBy: defaultLecturer._id
        });
        console.log('✅ Auto-seeded default Simulation');
      }

      const assignmentCount = await Assignment.countDocuments();
      if (assignmentCount === 0) {
        await Assignment.create([
          {
            simulationId: sim._id,
            title: 'Technical Analysis: FPT',
            symbol: 'FPT',
            description: 'Thực hành phân tích kỹ thuật xu hướng cổ phiếu FPT bằng các chỉ báo MACD và RSI.',
            instructions: 'Quan sát biến động nến của FPT. Sử dụng MACD để nhận diện giao cắt xu hướng và RSI để tìm vùng quá mua/quá bán. Thực hiện ít nhất một lệnh mua Limit trên hệ thống và thiết lập Stop Loss bảo vệ vốn.',
            requirements: [
              { id: 'r1', text: 'Quan sát và áp dụng chỉ báo MACD trên biểu đồ FPT' },
              { id: 'r2', text: 'Quan sát và áp dụng chỉ báo RSI trên biểu đồ FPT' },
              { id: 'r3', text: 'Viết nhận định tóm tắt về xu hướng giá FPT trong ngắn hạn' },
              { id: 'r4', text: 'Thực hành đặt lệnh Mua (Limit BUY) trên Trading Terminal' },
              { id: 'r5', text: 'Thiết lập mức Cắt lỗ (Stop Loss) an toàn cho lệnh' },
            ],
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            createdBy: defaultLecturer._id,
            status: 'OPEN',
          },
          {
            simulationId: sim._id,
            title: 'Risk Management Strategy: VN30',
            symbol: 'VN30',
            description: 'Xây dựng kế hoạch quản trị rủi ro vốn không quá 5% cho mỗi giao dịch.',
            instructions: 'Lập kế hoạch phân bổ vốn khi thị trường biến động mạnh. Đảm bảo tỷ lệ Risk/Reward tối thiểu 1:2 cho mọi vị thế mở.',
            requirements: [
              { id: 'r1', text: 'Xác định mức chịu lỗ tối đa cho từng lệnh (không quá 5%)' },
              { id: 'r2', text: 'Tính toán khối lượng và đòn bẩy phù hợp' },
              { id: 'r3', text: 'Nộp nhận định chiến lược phân bổ danh mục' },
            ],
            deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            createdBy: defaultLecturer._id,
            status: 'OPEN',
          }
        ]);
        console.log('✅ Auto-seeded sample Assignments');
      }
    } catch (seedErr) {
      console.warn('Auto-seed warning:', seedErr);
    }

    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
  });
