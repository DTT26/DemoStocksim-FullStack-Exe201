import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Order from '../models/Order';
import TradeReview from '../models/TradeReview';
import AiChatMessage from '../models/AiChatMessage';
import Wallet from '../models/Wallet';
import Holding from '../models/Holding';
import Challenge from '../models/Challenge';
import { AuthRequest } from '../middleware/authMiddleware';

const router = Router();
const PYTHON_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

function getUserIdFromReq(req: Request): string {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded: any = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET || 'fallback_secret_key_change_this_in_production'
      );
      if (decoded?.userId) return decoded.userId;
    } catch {
      // ignore token verification failure, use fallback
    }
  }
  return '64f7b1e4a3b9c2d1e8f9a0b1';
}

async function forwardToPython(endpoint: string, method: string = 'POST', data?: any) {
  const url = `${PYTHON_URL}/internal/ai${endpoint}`;
  const options: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: data ? JSON.stringify(data) : undefined,
  };
  const resp = await fetch(url, options);
  if (!resp.ok) {
    const errorText = await resp.text();
    throw new Error(`Python AI Service error (${resp.status}): ${errorText}`);
  }
  return await resp.json();
}

// 1. Ask AI Tutor (with MongoDB persistence & full DB context)
router.post('/ask', async (req: Request, res: Response) => {
  try {
    const userId = req.body?.userId || getUserIdFromReq(req);
    const symbol = req.body?.symbol || 'BTCUSDT';
    const question = req.body?.question || '';

    // Persist user question
    if (question && question.trim()) {
      try {
        await AiChatMessage.create({
          userId,
          symbol,
          sender: 'user',
          text: question
        });
      } catch (saveErr) {
        console.warn('Could not save user message to DB:', saveErr);
      }
    }

    // Query user live portfolio & DB data to provide full database context to AI
    let userData: any = null;
    try {
      const [wallet, holdings, pendingOrders, activeChallenge, recentOrders] = await Promise.all([
        Wallet.findOne({ userId }),
        Holding.find({ userId }),
        Order.find({ userId, status: 'PENDING' }),
        Challenge.findOne({ userId, status: { $in: ['ACTIVE', 'PAUSED', 'FAILED', 'PASSED'] } }),
        Order.find({ userId }).sort({ createdAt: -1 }).limit(5)
      ]);

      userData = {
        wallet: {
          balance: wallet?.balance ?? 10000,
          availableBalance: wallet?.availableBalance ?? 10000
        },
        positions: holdings.map(h => ({
          symbol: h.symbol,
          side: h.side,
          quantity: h.quantity,
          entryPrice: h.averagePrice,
          leverage: h.leverage,
          tp: h.tp,
          sl: h.sl,
          accountType: h.accountType
        })),
        pendingOrders: pendingOrders.map(o => ({
          symbol: o.symbol,
          side: o.side,
          price: o.price,
          quantity: o.quantity,
          type: o.type
        })),
        recentOrders: recentOrders.map(o => ({
          symbol: o.symbol,
          side: o.side,
          price: o.price,
          quantity: o.quantity,
          status: o.status
        })),
        challenge: activeChallenge ? {
          status: activeChallenge.status,
          level: activeChallenge.currentLevel,
          capital: activeChallenge.startingCapitalUSD,
          currentBalance: activeChallenge.currentBalanceUSD,
          totalProfit: activeChallenge.totalProfitUSD,
          dailyLoss: activeChallenge.dailyLossUSD,
          maxLoss: activeChallenge.maxLossUSD
        } : null
      };
    } catch (dbErr) {
      console.warn('Could not query user DB portfolio:', dbErr);
    }

    const payload = {
      ...req.body,
      userData: userData || req.body?.userData
    };

    const data = await forwardToPython('/ask', 'POST', payload);

    // Persist tutor answer
    if (data?.answer) {
      try {
        await AiChatMessage.create({
          userId,
          symbol,
          sender: 'tutor',
          text: data.answer,
          data
        });
      } catch (saveErr) {
        console.warn('Could not save tutor response to DB:', saveErr);
      }
    }

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('AI Ask error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Explain Concept (with MongoDB persistence)
router.post('/explain-concept', async (req: Request, res: Response) => {
  try {
    const userId = req.body?.userId || getUserIdFromReq(req);
    const symbol = req.body?.symbol || 'BTCUSDT';
    const concept = req.body?.concept || '';

    // Persist user request
    if (concept && concept.trim()) {
      try {
        await AiChatMessage.create({
          userId,
          symbol,
          sender: 'user',
          text: `Giải thích khái niệm: ${concept}`
        });
      } catch (saveErr) {
        console.warn('Could not save concept question to DB:', saveErr);
      }
    }

    const data = await forwardToPython('/explain-concept', 'POST', req.body);

    // Persist tutor explanation
    if (data?.answer) {
      try {
        await AiChatMessage.create({
          userId,
          symbol,
          sender: 'tutor',
          text: data.answer,
          data
        });
      } catch (saveErr) {
        console.warn('Could not save concept answer to DB:', saveErr);
      }
    }

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('AI Explain Concept error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. Analyze Trade
router.post('/analyze-trade', async (req: Request, res: Response) => {
  try {
    let payload = { ...req.body };
    if (payload.orderId) {
      const order = await Order.findById(payload.orderId);
      if (order) {
        payload.symbol = payload.symbol || order.symbol;
        payload.side = payload.side || order.side;
        payload.entryPrice = payload.entryPrice || order.price;
        payload.stopLoss = payload.stopLoss || order.stopLoss;
        payload.takeProfit = payload.takeProfit || order.takeProfit;
        payload.quantity = payload.quantity || order.quantity;
      }
    }
    const data = await forwardToPython('/analyze-trade', 'POST', payload);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('AI Analyze Trade error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. Review Trade & Save to Journal
router.post('/review-trade', async (req: AuthRequest, res: Response) => {
  try {
    let payload = { ...req.body };
    if (payload.orderId) {
      const order = await Order.findById(payload.orderId);
      if (order) {
        payload.symbol = payload.symbol || order.symbol;
        payload.side = payload.side || order.side;
        payload.entryPrice = payload.entryPrice || order.price;
        payload.stopLoss = payload.stopLoss || order.stopLoss;
        payload.takeProfit = payload.takeProfit || order.takeProfit;
        payload.quantity = payload.quantity || order.quantity;
      }
    }
    const data = await forwardToPython('/review-trade', 'POST', payload);
    
    // Save review if user or dummy ID is present
    const userId = req.user?._id || '64f7b1e4a3b9c2d1e8f9a0b1';
    try {
      await TradeReview.create({
        userId,
        orderId: payload.orderId,
        symbol: payload.symbol,
        side: payload.side,
        entryPrice: payload.entryPrice,
        exitPrice: payload.exitPrice,
        stopLoss: payload.stopLoss,
        takeProfit: payload.takeProfit,
        processScore: data.summary?.processScore || 80,
        tradeVerdict: data.summary?.tradeVerdict || 'REVIEWED',
        verdictDescription: data.summary?.verdictDescription || '',
        fullAnalysis: data,
        userNotes: payload.userNotes
      });
    } catch (saveErr) {
      console.warn('Could not persist TradeReview to DB:', saveErr);
    }

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('AI Review Trade error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4b. Submit Student Reflection & Get Coach Feedback
router.post('/submit-reflection', async (req: Request, res: Response) => {
  try {
    const data = await forwardToPython('/submit-reflection', 'POST', req.body);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('AI Submit Reflection error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. Compare Strategies (Price Action vs ICT)
router.post('/compare-strategies', async (req: Request, res: Response) => {
  try {
    const data = await forwardToPython('/compare-strategies', 'POST', req.body);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('AI Compare Strategies error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. Backtest Assistant
router.post('/backtest-assistant', async (req: Request, res: Response) => {
  try {
    const data = await forwardToPython('/backtest-assistant', 'POST', req.body);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('AI Backtest Assistant error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 7. Trade Insights & Pattern Detection
router.post('/trade-insights', async (req: AuthRequest, res: Response) => {
  try {
    let trades = req.body?.trades || [];
    // If no trades sent in body, attempt to fetch user's past filled orders
    if (!trades || trades.length === 0) {
      const userId = req.user?._id || '64f7b1e4a3b9c2d1e8f9a0b1';
      const pastOrders = await Order.find({ userId }).sort({ createdAt: -1 }).limit(30);
      trades = pastOrders.map(o => ({
        tradeId: o._id.toString(),
        symbol: o.symbol,
        side: o.side,
        entryPrice: o.price,
        exitPrice: o.price * (o.side === 'LONG' ? 1.02 : 0.98), // simulated exit if pending
        stopLoss: o.stopLoss,
        takeProfit: o.takeProfit,
        quantity: o.quantity,
        timeframe: '15m'
      }));
    }
    const data = await forwardToPython('/trade-insights', 'POST', { trades });
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('AI Trade Insights error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 8. Sources
router.get('/sources', async (req: Request, res: Response) => {
  try {
    const data = await forwardToPython('/sources', 'GET');
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('AI Sources error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 9. Learning Progress
router.get('/learning-progress', async (req: Request, res: Response) => {
  try {
    const data = await forwardToPython('/learning-progress', 'GET');
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('AI Learning Progress error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 10. List Saved Reviews
router.get('/reviews', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id || '64f7b1e4a3b9c2d1e8f9a0b1';
    const reviews = await TradeReview.find({ userId }).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: reviews });
  } catch (error: any) {
    console.error('Get Reviews error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 11. Chat History
router.get('/chat-history', async (req: Request, res: Response) => {
  try {
    const userId = (req.query?.userId as string) || getUserIdFromReq(req);
    const symbol = req.query?.symbol as string;
    const limit = parseInt(req.query?.limit as string) || 50;

    const filter: any = { userId };
    if (symbol && symbol !== 'ALL') {
      filter.symbol = symbol;
    }

    const messages = await AiChatMessage.find(filter)
      .sort({ createdAt: 1 })
      .limit(limit);

    res.json({
      success: true,
      data: messages.map(m => ({
        id: m._id.toString(),
        sender: m.sender,
        text: m.text,
        data: m.data,
        symbol: m.symbol,
        createdAt: m.createdAt
      }))
    });
  } catch (error: any) {
    console.error('Get Chat History error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 12. Clear Chat History
router.delete('/chat-history', async (req: Request, res: Response) => {
  try {
    const userId = (req.query?.userId as string) || getUserIdFromReq(req);
    const symbol = req.query?.symbol as string;

    const query: any = { userId };
    if (symbol && symbol !== 'ALL') query.symbol = symbol;

    await AiChatMessage.deleteMany(query);
    res.json({ success: true, message: 'Đã xóa lịch sử chat thành công' });
  } catch (error: any) {
    console.error('Clear Chat History error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
