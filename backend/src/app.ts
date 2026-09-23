import express from 'express';
import cors from 'cors';
import tradingRoutes from './routes/tradingRoutes';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import simulationRoutes from './routes/simulation';
import assignmentRoutes from './routes/assignment';
import challengeRoutes from './routes/challengeRoutes';
import stockRoutes from './routes/stockRoutes';
import walletRoutes from './routes/walletRoutes';

const app = express();

app.use(cors());
app.use(express.json());

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
app.use('/api/challenge', challengeRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/wallet', walletRoutes);

export default app;
