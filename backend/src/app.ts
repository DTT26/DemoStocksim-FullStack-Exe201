import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import tradingRoutes from './routes/tradingRoutes';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import simulationRoutes from './routes/simulation';
import assignmentRoutes from './routes/assignment';
import watchlistRoutes from './routes/watchlist';
import paperTradingRoutes from './routes/paperTrading';
import challengeRoutes from './routes/challengeRoutes';
import stockRoutes from './routes/stockRoutes';
import walletRoutes from './routes/walletRoutes';

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'stocksim-api' });
});

// Routes
app.use('/api/trade', tradingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/simulations', simulationRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/watchlists', watchlistRoutes);
app.use('/api/paper-trading', paperTradingRoutes);
app.use('/api/challenge', challengeRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/wallet', walletRoutes);

export default app;
