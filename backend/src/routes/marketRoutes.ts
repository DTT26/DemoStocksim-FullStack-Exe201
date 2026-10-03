import { Router, Request, Response } from 'express';

const router = Router();

// Mapping chuẩn từ mã hệ thống sang ký hiệu của Yahoo Finance
export const YAHOO_SYMBOL_MAP: Record<string, string> = {
  // Chỉ số toàn cầu (Indices)
  'SPX': '^GSPC',
  'NDX': '^IXIC',
  'DJI': '^DJI',
  'DXY': 'DX-Y.NYB',
  'JP225': '^N225',
  'UK100': '^FTSE',
  'EU50': '^STOXX50E',
  'US2000': '^RUT',

  // Hàng hóa & Năng lượng (Commodities & Energy)
  'XAUUSD': 'GC=F',
  'XAGUSD': 'SI=F',
  'USOIL': 'CL=F',
  'BRENT': 'BZ=F',
  'NGAS': 'NG=F',
  'COPPER': 'HG=F',
  'PLATINUM': 'PL=F',

  // Ngoại hối (Forex)
  'EURUSD': 'EURUSD=X',
  'GBPUSD': 'GBPUSD=X',
  'USDJPY': 'JPY=X',
  'AUDUSD': 'AUDUSD=X',
  'USDCAD': 'CAD=X',
  'USDCHF': 'CHF=X',
  'NZDUSD': 'NZDUSD=X',
  'GBPJPY': 'GBPJPY=X',
  'EURJPY': 'EURJPY=X',
  'EURGBP': 'EURGBP=X',
  'AUDJPY': 'AUDJPY=X',
  'CHFJPY': 'CHFJPY=X',
  'CADJPY': 'CADJPY=X',

  // Cổ phiếu Mỹ (US Equities)
  'AAPL': 'AAPL',
  'MSFT': 'MSFT',
  'TSLA': 'TSLA',
  'NVDA': 'NVDA',
  'GOOGL': 'GOOGL',
  'AMZN': 'AMZN',
  'META': 'META',
  'AMD': 'AMD',
  'INTC': 'INTC',
  'BABA': 'BABA',
  'DIS': 'DIS',
  'COIN': 'COIN',
  'UBER': 'UBER',
  'ORCL': 'ORCL',
  'KO': 'KO',
  'JNJ': 'JNJ',
};

// Bộ nhớ đệm (Cache) để giảm tải và tránh rate-limit
let cachedQuotes: Record<string, any> = {};
let lastQuotesFetchTime = 0;
const QUOTE_CACHE_TTL_MS = 5000; // 5 giây

const klineCache = new Map<string, { time: number; data: any[] }>();
const KLINE_CACHE_TTL_MS = 15000; // 15 giây

let cachedBingxTicker: any = null;
let lastBingxTickerTime = 0;
const BINGX_TICKER_TTL_MS = 2000; // 2 giây

const bingxKlinesCache = new Map<string, { time: number; data: any }>();
const BINGX_KLINES_TTL_MS = 3000; // 3 giây

/**
 * GET /api/market/bingx/ticker
 * Proxy lấy 24hr ticker từ BingX qua server (loại bỏ hoàn toàn lỗi CORS 403 trên trình duyệt)
 */
router.get('/bingx/ticker', async (req: Request, res: Response) => {
  try {
    const now = Date.now();
    if (now - lastBingxTickerTime < BINGX_TICKER_TTL_MS && cachedBingxTicker) {
      return res.json(cachedBingxTicker);
    }
    const resp = await fetch('https://open-api.bingx.com/openApi/swap/v2/quote/ticker');
    if (!resp.ok) {
      if (cachedBingxTicker) return res.json(cachedBingxTicker);
      return res.status(resp.status).json({ code: -1, msg: `BingX ticker status ${resp.status}` });
    }
    const json = await resp.json();
    cachedBingxTicker = json;
    lastBingxTickerTime = now;
    return res.json(json);
  } catch (err: any) {
    if (cachedBingxTicker) return res.json(cachedBingxTicker);
    return res.status(500).json({ code: -1, msg: err.message });
  }
});

/**
 * GET /api/market/bingx/klines
 * Proxy lấy nến từ BingX qua server (loại bỏ hoàn toàn lỗi CORS 403 trên trình duyệt)
 */
router.get('/bingx/klines', async (req: Request, res: Response) => {
  try {
    const symbol = (req.query.symbol as string) || '';
    const interval = (req.query.interval as string) || '1d';
    const limit = (req.query.limit as string) || '500';
    const startTime = req.query.startTime as string;
    const endTime = req.query.endTime as string;

    if (!symbol) {
      return res.status(400).json({ code: -1, msg: 'Missing symbol' });
    }

    const cacheKey = `${symbol}-${interval}-${limit}-${startTime || ''}-${endTime || ''}`;
    const now = Date.now();
    const cached = bingxKlinesCache.get(cacheKey);
    if (cached && now - cached.time < BINGX_KLINES_TTL_MS) {
      return res.json(cached.data);
    }

    let url = `https://open-api.bingx.com/openApi/swap/v3/quote/klines?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&limit=${encodeURIComponent(limit)}`;
    if (startTime) url += `&startTime=${encodeURIComponent(startTime)}`;
    if (endTime) url += `&endTime=${encodeURIComponent(endTime)}`;

    const resp = await fetch(url);
    if (!resp.ok) {
      if (cached) return res.json(cached.data);
      return res.status(resp.status).json({ code: -1, msg: `BingX HTTP error ${resp.status}` });
    }
    const json = await resp.json();
    bingxKlinesCache.set(cacheKey, { time: now, data: json });
    return res.json(json);
  } catch (err: any) {
    return res.status(500).json({ code: -1, msg: err.message });
  }
});

/**
 * GET /api/market/quotes
 * Lấy giá trực tiếp, % thay đổi và thông số 24h cho các chỉ số và forex
 */
router.get('/quotes', async (req: Request, res: Response) => {
  try {
    const now = Date.now();
    if (now - lastQuotesFetchTime < QUOTE_CACHE_TTL_MS && Object.keys(cachedQuotes).length > 0) {
      return res.json({ success: true, data: cachedQuotes });
    }

    const symbols = Object.keys(YAHOO_SYMBOL_MAP);
    const fetchPromises = symbols.map(async (stdSym) => {
      const ySym = YAHOO_SYMBOL_MAP[stdSym];
      try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ySym)}?interval=1d&range=2d`;
        const resp = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
        });
        if (!resp.ok) return null;
        const json: any = await resp.json();
        const meta = json.chart?.result?.[0]?.meta;
        if (!meta) return null;

        const currentPrice = meta.regularMarketPrice || meta.chartPreviousClose || 0;
        const prevClose = meta.previousClose || meta.chartPreviousClose || currentPrice;
        const change = currentPrice - prevClose;
        const percent = prevClose > 0 ? (change / prevClose) * 100 : 0;
        const high24h = meta.regularMarketDayHigh || currentPrice;
        const low24h = meta.regularMarketDayLow || currentPrice;
        const volume24h = meta.regularMarketVolume || 0;

        return {
          symbol: stdSym,
          price: currentPrice,
          change: parseFloat(change.toFixed(4)),
          percent: parseFloat(percent.toFixed(2)),
          type: change >= 0 ? 'up' : 'down',
          high24h,
          low24h,
          volume24h,
          quoteVolume24h: volume24h,
          openPrice: prevClose,
        };
      } catch (e) {
        return null;
      }
    });

    const results = await Promise.all(fetchPromises);
    const quoteMap: Record<string, any> = {};
    for (const item of results) {
      if (item) {
        quoteMap[item.symbol] = item;
      }
    }

    if (Object.keys(quoteMap).length > 0) {
      cachedQuotes = quoteMap;
      lastQuotesFetchTime = now;
    }

    return res.json({ success: true, data: cachedQuotes });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/market/klines
 * Lấy lịch sử nến OHLCV chuẩn quốc tế cho các Chỉ số & Forex
 * Params: symbol, timeframe (1m, 5m, 15m, 30m, 1h, 4h, D, W, M), limit
 */
router.get('/klines', async (req: Request, res: Response) => {
  try {
    const symbol = ((req.query.symbol as string) || '').toUpperCase();
    const timeframe = (req.query.timeframe as string) || 'D';
    const limit = parseInt((req.query.limit as string) || '500', 10);

    const ySym = YAHOO_SYMBOL_MAP[symbol];
    if (!ySym) {
      return res.status(404).json({ success: false, message: `Symbol ${symbol} not supported in Yahoo provider` });
    }

    // Map timeframe sang Yahoo interval & range
    let interval = '1d';
    let range = '1y';

    switch (timeframe) {
      case '1m':
        interval = '1m';
        range = '5d';
        break;
      case '5m':
        interval = '5m';
        range = '1mo';
        break;
      case '15m':
        interval = '15m';
        range = '1mo';
        break;
      case '30m':
        interval = '30m';
        range = '1mo';
        break;
      case '1h':
        interval = '60m';
        range = '3mo';
        break;
      case '4h':
        interval = '60m';
        range = '6mo';
        break;
      case 'D':
      case '1d':
        interval = '1d';
        range = '1y';
        break;
      case 'W':
      case '1w':
        interval = '1wk';
        range = '2y';
        break;
      case 'M':
      case '1M':
        interval = '1mo';
        range = '5y';
        break;
      default:
        interval = '1d';
        range = '1y';
    }

    const cacheKey = `${ySym}-${interval}-${range}`;
    const cached = klineCache.get(cacheKey);
    const now = Date.now();
    if (cached && now - cached.time < KLINE_CACHE_TTL_MS) {
      const sliced = cached.data.slice(-limit);
      return res.json({ success: true, data: sliced });
    }

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ySym)}?interval=${interval}&range=${range}`;
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (!resp.ok) {
      return res.status(resp.status).json({ success: false, message: `Yahoo Finance HTTP error ${resp.status}` });
    }

    const json: any = await resp.json();
    const result = json.chart?.result?.[0];
    if (!result || !Array.isArray(result.timestamp)) {
      return res.json({ success: true, data: [] });
    }

    const timestamps: number[] = result.timestamp;
    const quotes = result.indicators?.quote?.[0] || {};
    const opens = quotes.open || [];
    const highs = quotes.high || [];
    const lows = quotes.low || [];
    const closes = quotes.close || [];
    const volumes = quotes.volume || [];

    const klines: any[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      const open = opens[i];
      const close = closes[i];
      if (open != null && close != null && !isNaN(open) && !isNaN(close)) {
        const high = highs[i] != null && !isNaN(highs[i]) ? highs[i] : Math.max(open, close);
        const low = lows[i] != null && !isNaN(lows[i]) ? lows[i] : Math.min(open, close);
        const volume = volumes[i] != null && !isNaN(volumes[i]) ? volumes[i] : 0;

        klines.push({
          timestamp: timestamps[i] * 1000,
          open: parseFloat(open.toFixed(4)),
          high: parseFloat(high.toFixed(4)),
          low: parseFloat(low.toFixed(4)),
          close: parseFloat(close.toFixed(4)),
          volume: Math.round(volume),
        });
      }
    }

    // Sắp xếp ascending timestamp
    klines.sort((a, b) => a.timestamp - b.timestamp);

    klineCache.set(cacheKey, { time: now, data: klines });
    const sliced = klines.slice(-limit);
    return res.json({ success: true, data: sliced });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// TWELVE DATA INTEGRATION (XAU/USD, Forex, Stocks)
// ==========================================
export const TWELVE_DATA_MAP: Record<string, string> = {
  'XAUUSD': 'XAU/USD',
  'EURUSD': 'EUR/USD',
  'GBPUSD': 'GBP/USD',
  'USDJPY': 'USD/JPY',
  'AUDUSD': 'AUD/USD',
  'USDCAD': 'USD/CAD',
  'USDCHF': 'USD/CHF',
  'NZDUSD': 'NZD/USD',
  'EURJPY': 'EUR/JPY',
  'GBPJPY': 'GBP/JPY',
  'AAPL': 'AAPL',
  'MSFT': 'MSFT',
  'TSLA': 'TSLA',
  'NVDA': 'NVDA',
};

const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY || '70fedd8a2166410a9d1a495af14a6e2a';
const tdPriceCache = new Map<string, { time: number; price: number }>();
const TD_PRICE_CACHE_MS = 15000; // Cache 15s để tránh vượt 8 request/phút của gói Basic

const tdKlineCache = new Map<string, { time: number; data: any[] }>();
const TD_KLINE_CACHE_MS = 60000; // Cache 60s

/**
 * GET /api/market/twelvedata/price
 * Lấy giá thời gian thực từ Twelve Data với bộ đệm chống vượt ngưỡng 8 request/phút
 */
router.get('/twelvedata/price', async (req: Request, res: Response) => {
  try {
    const symbol = ((req.query.symbol as string) || '').toUpperCase();
    const tdSym = TWELVE_DATA_MAP[symbol] || symbol;

    const now = Date.now();
    const cached = tdPriceCache.get(tdSym);
    if (cached && now - cached.time < TD_PRICE_CACHE_MS) {
      return res.json({ success: true, symbol, price: cached.price, cached: true });
    }

    const url = `https://api.twelvedata.com/price?symbol=${encodeURIComponent(tdSym)}&apikey=${TWELVE_DATA_API_KEY}`;
    const resp = await fetch(url);
    if (!resp.ok) {
      if (cached) return res.json({ success: true, symbol, price: cached.price, stale: true });
      return res.status(resp.status).json({ success: false, message: `Twelve Data HTTP ${resp.status}` });
    }

    const json = await resp.json();
    if (json.price) {
      const price = parseFloat(json.price);
      tdPriceCache.set(tdSym, { time: now, price });
      return res.json({ success: true, symbol, price });
    }

    if (cached) return res.json({ success: true, symbol, price: cached.price, stale: true });
    return res.status(400).json({ success: false, message: json.message || 'Error from Twelve Data' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/market/twelvedata/klines
 * Lấy nến OHLCV chuẩn từ Twelve Data (hỗ trợ vàng XAU/USD và Forex)
 */
router.get('/twelvedata/klines', async (req: Request, res: Response) => {
  try {
    const symbol = ((req.query.symbol as string) || '').toUpperCase();
    const timeframe = (req.query.timeframe as string) || '1d';
    const limit = parseInt((req.query.limit as string) || '100', 10);
    const tdSym = TWELVE_DATA_MAP[symbol] || symbol;

    let interval = '1day';
    switch (timeframe) {
      case '1m': interval = '1min'; break;
      case '5m': interval = '5min'; break;
      case '15m': interval = '15min'; break;
      case '30m': interval = '30min'; break;
      case '1h': interval = '1h'; break;
      case '4h': interval = '4h'; break;
      case 'D':
      case '1d': interval = '1day'; break;
      case 'W':
      case '1w': interval = '1week'; break;
      case 'M':
      case '1M': interval = '1month'; break;
    }

    const cacheKey = `${tdSym}-${interval}-${limit}`;
    const now = Date.now();
    const cached = tdKlineCache.get(cacheKey);
    if (cached && now - cached.time < TD_KLINE_CACHE_MS) {
      return res.json({ success: true, data: cached.data });
    }

    const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(tdSym)}&interval=${interval}&outputsize=${limit}&apikey=${TWELVE_DATA_API_KEY}`;
    const resp = await fetch(url);
    if (!resp.ok) {
      if (cached) return res.json({ success: true, data: cached.data, stale: true });
      return res.status(resp.status).json({ success: false, message: `Twelve Data HTTP ${resp.status}` });
    }

    const json = await resp.json();
    if (json.status === 'ok' && Array.isArray(json.values)) {
      const klines = json.values.map((v: any) => ({
        timestamp: new Date(v.datetime).getTime(),
        open: parseFloat(v.open),
        high: parseFloat(v.high),
        low: parseFloat(v.low),
        close: parseFloat(v.close),
        volume: parseFloat(v.volume || '0'),
      })).sort((a: any, b: any) => a.timestamp - b.timestamp);

      tdKlineCache.set(cacheKey, { time: now, data: klines });
      return res.json({ success: true, data: klines });
    }

    if (cached) return res.json({ success: true, data: cached.data, stale: true });
    return res.status(400).json({ success: false, message: json.message || 'Error from Twelve Data' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
