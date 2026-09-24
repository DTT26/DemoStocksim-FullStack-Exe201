import { Router, Request, Response } from 'express';
import Order from '../models/Order';
import TradeReview from '../models/TradeReview';
import { AuthRequest } from '../middleware/authMiddleware';

const router = Router();
const PYTHON_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

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

// 1. Ask AI Tutor
router.post('/ask', async (req: Request, res: Response) => {
  try {
    const data = await forwardToPython('/ask', 'POST', req.body);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('AI Ask error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Explain Concept
router.post('/explain-concept', async (req: Request, res: Response) => {
  try {
    const data = await forwardToPython('/explain-concept', 'POST', req.body);
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

export default router;
