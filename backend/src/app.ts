import express from 'express';
import cors from 'cors';
import tradingRoutes from './routes/tradingRoutes';

const app = express();

app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'stocksim-api' });
});

// Routes
app.use('/api/trade', tradingRoutes);
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/stocks', stockRoutes);

export default app;
