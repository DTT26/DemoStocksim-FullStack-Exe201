import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Order from '../models/Order';
import TradeReview from '../models/TradeReview';
import AiChatMessage from '../models/AiChatMessage';
import Wallet from '../models/Wallet';
import Holding from '../models/Holding';
import Challenge from '../models/Challenge';
import { AuthRequest, protect, optionalProtect } from '../middleware/authMiddleware';

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
  const cleanBaseUrl = PYTHON_URL.replace(/\/+$/, '');
  const url = `${cleanBaseUrl}/internal/ai${endpoint}`;
  const options: RequestInit = {
    method,
    headers: { 
      'Content-Type': 'application/json',
      'Connection': 'keep-alive'
    },
    body: data ? JSON.stringify(data) : undefined,
    signal: AbortSignal.timeout(65000), // Cho phép 65s để Render khởi động nếu đang ngủ (cold-start)
  };

  let lastError: any = null;
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const resp = await fetch(url, options);
      if (!resp.ok) {
        if ((resp.status === 502 || resp.status === 503 || resp.status === 504) && attempt < maxAttempts) {
          console.warn(`[AI Route] Python service returned ${resp.status} on attempt ${attempt}. Retrying in 6s for cold-start recovery...`);
          await new Promise(r => setTimeout(r, 6000));
          continue;
        }
        const errorText = await resp.text();
        const isHtml = errorText.trim().startsWith('<') || errorText.includes('<!DOCTYPE html');
        const cleanMsg = isHtml 
          ? `Dịch vụ AI đang khởi động (Cold-start) hoặc tạm thời không khả dụng trên Render (${resp.status} Bad Gateway). Vui lòng thử lại sau 30-60 giây.`
          : errorText.slice(0, 300);
        throw new Error(`Python AI Service error (${resp.status}): ${cleanMsg}`);
      }
      return await resp.json();
    } catch (err: any) {
      lastError = err;
      if (attempt < maxAttempts) {
        console.warn(`[AI Route] Python connection error on attempt ${attempt}: ${err?.message}. Retrying...`);
        await new Promise(r => setTimeout(r, 4000));
      }
    }
  }
  throw lastError;
}

// Middleware: Khóa toàn bộ tính năng AI nếu người dùng đang trong bài thi Thử Thách Quỹ (status: ACTIVE)
const blockIfInActiveChallenge = async (req: Request, res: Response, next: any) => {
  if (req.method === 'POST') {
    try {
      const userId = (req as any).user?._id?.toString() || req.body?.userId || getUserIdFromReq(req);
      if (userId && userId !== '64f7b1e4a3b9c2d1e8f9a0b1' && userId !== 'guest_user') {
        const activeChallenge = await Challenge.findOne({ userId, status: 'ACTIVE' });
        if (activeChallenge) {
          const isEn = (req.body?.lang || '').toLowerCase().startsWith('en');
          return res.status(403).json({
            success: false,
            guardrailTriggered: 'CHALLENGE_ACTIVE_BLOCKED',
            message: isEn
              ? 'Your account is currently taking an active Prop Firm Challenge. All AI features are locked according to competition rules to ensure integrity and realistic trading evaluation.'
              : 'Tài khoản của bạn đang trong bài thi Thử Thách Cấp Vốn Quỹ (Prop Firm Challenge). Toàn bộ tính năng AI bị khóa theo quy chế thi để đảm bảo tính minh bạch và đánh giá độc lập năng lực giao dịch thực tế.'
          });
        }
      }
    } catch (err) {
      console.warn('[AI Guardrail] blockIfInActiveChallenge check error:', err);
    }
  }
  next();
};

router.use(blockIfInActiveChallenge);

// 1. Ask AI Tutor (Bắt buộc đăng nhập tài khoản)
router.post('/ask', protect, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id.toString();
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
      userId,
      userData: userData || req.body?.userData
    };

    const data = await forwardToPython('/ask', 'POST', payload);

    // If quota exceeded, return controlled tutor message
    if (data && data.success === false && data.guardrailTriggered === 'QUOTA_EXCEEDED') {
      return res.json({
        success: true,
        data: {
          answer: data.message,
          guardrailTriggered: 'QUOTA_EXCEEDED',
          remainingToday: data.remainingToday,
          plan: data.plan,
          sources: [],
          socraticQuestions: []
        }
      });
    }

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

// 1.1 Ask AI Tutor with Server-Sent Events (SSE Streaming)
router.post('/ask-stream', protect, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id.toString();
    const symbol = req.body?.symbol || 'BTCUSDT';
    const question = req.body?.question || '';

    // Persist user question in DB
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
      userId,
      userData: userData || req.body?.userData
    };

    const cleanBaseUrl = PYTHON_URL.replace(/\/+$/, '');
    const url = `${cleanBaseUrl}/internal/ai/ask-stream`;

    // Setup SSE response headers for client
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    let fullAnswer = '';
    let doneData: any = null;

    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Connection': 'keep-alive'
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(65000)
      });

      if (!resp.ok || !resp.body) {
        const errorText = await resp.text();
        const cleanMsg = errorText.includes('<!DOCTYPE html') || errorText.length > 200
          ? `Máy chủ AI Render đang khởi động (${resp.status}). Vui lòng thử lại sau 30-60 giây.`
          : errorText;
        res.write(`data: ${JSON.stringify({ type: 'error', message: cleanMsg })}\n\n`);
        return res.end();
      }

      // Stream chunks from python service to frontend
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        res.write(text);
        buffer += text;

        // Parse accumulated text to capture tokens for DB persistence
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(line.slice(6));
              if (parsed.type === 'token' && parsed.token) {
                fullAnswer += parsed.token;
              } else if (parsed.type === 'done') {
                doneData = parsed;
                if (parsed.answer) fullAnswer = parsed.answer;
              }
            } catch {
              // ignore partial line JSON parse errors
            }
          }
        }
      }

      // Save complete AI response to DB
      if (fullAnswer.trim()) {
        try {
          await AiChatMessage.create({
            userId,
            symbol,
            sender: 'tutor',
            text: fullAnswer,
            data: doneData || { answer: fullAnswer }
          });
        } catch (saveErr) {
          console.warn('Could not save streamed tutor message to DB:', saveErr);
        }
      }

      res.end();
    } catch (fetchErr: any) {
      console.error('Error streaming from Python service:', fetchErr);
      res.write(`data: ${JSON.stringify({ type: 'error', message: fetchErr.message || 'Lỗi kết nối streaming AI' })}\n\n`);
      res.end();
    }
  } catch (error: any) {
    console.error('AI Ask Stream error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.end();
    }
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

// 11. Chat History (Bắt buộc đăng nhập)
router.get('/chat-history', protect, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id.toString();
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

// 12. Clear Chat History (Bắt buộc đăng nhập)
router.delete('/chat-history', protect, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id.toString();
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

// 13. Inspect Chart Vision (Soi biểu đồ AI)
router.post('/inspect-chart', optionalProtect, async (req: any, res: Response) => {
  try {
    const userId = req.user?._id?.toString() || req.body?.userId || 'guest_user';
    const { image, symbol, timeframe, userNotes } = req.body;

    if (!image) {
      return res.status(400).json({ success: false, message: 'Thiếu dữ liệu ảnh biểu đồ (image base64)' });
    }

    const result = await forwardToPython('/inspect-chart', 'POST', {
      image,
      symbol: symbol || '',
      timeframe: timeframe || '',
      userNotes: userNotes || '',
      userId
    });

    return res.json(result);
  } catch (error: any) {
    console.error('Inspect Chart error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi soi biểu đồ' });
  }
});

// 14. Inspect Chart Structured Drawings Data (Tự động đọc dữ liệu nến và hình vẽ trên biểu đồ)
router.post('/inspect-chart-data', optionalProtect, async (req: any, res: Response) => {
  try {
    const userId = req.user?._id?.toString() || req.body?.userId || 'guest_user';
    const { drawings, klines, symbol, timeframe, userNotes } = req.body;

    if (!drawings || !Array.isArray(drawings) || drawings.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bạn chưa vẽ vùng phân tích nào trên biểu đồ. Hãy dùng thanh công cụ bên trái (Hộp chữ nhật, Đường kẻ) để đánh dấu vùng Order Block / FVG trước nhé!' 
      });
    }

    const result = await forwardToPython('/inspect-chart-data', 'POST', {
      drawings,
      klines: klines || [],
      symbol: symbol || '',
      timeframe: timeframe || '',
      userNotes: userNotes || '',
      userId
    });

    return res.json(result);
  } catch (error: any) {
    console.error('Inspect Chart Data error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi phân tích dữ liệu hình vẽ' });
  }
});

export default router;
