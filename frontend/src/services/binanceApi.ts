import type { KLineData } from 'klinecharts';

export type BinanceInterval = '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '6h' | '8h' | '12h' | '1d' | '3d' | '1w' | '1M';

export interface FetchKlinesParams {
  symbol: string;
  interval: BinanceInterval;
  limit?: number;
  isFutures?: boolean;
  endTime?: number; // Thêm endTime để tải dữ liệu lịch sử
}

// In-memory cache to avoid rate limits and speed up tab switching
const klineCache = new Map<string, KLineData[]>();

export const cleanBinanceSymbol = (symbol: string): string => {
  let s = symbol.replace('.P', '').replace('.SWAP', '');
  if (s.endsWith('USD') && !s.endsWith('USDT')) {
    s = s + 'T';
  }
  return s;
};

/**
 * Lấy dữ liệu OHLCV từ Binance (Spot hoặc Futures)
 */
export const fetchBinanceKlines = async ({ symbol, interval, limit = 500, isFutures = false, endTime }: FetchKlinesParams): Promise<KLineData[]> => {
  const cleanSymbol = cleanBinanceSymbol(symbol);
  
  const cacheKey = `${cleanSymbol}-${interval}-${isFutures ? 'futures' : 'spot'}-${limit}-${endTime || 'latest'}`;
  
  if (klineCache.has(cacheKey)) {
    return klineCache.get(cacheKey)!;
  }

  const baseUrl = isFutures ? 'https://fapi.binance.com/fapi/v1' : 'https://api.binance.com/api/v3';
  let url = `${baseUrl}/klines?symbol=${cleanSymbol}&interval=${interval}&limit=${limit}`;
  if (endTime) {
    url += `&endTime=${endTime}`;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status} ${response.statusText}`);
    }

    const data: any[][] = await response.json();
    if (!Array.isArray(data)) {
      return [];
    }
    
    // Binance format:
    // [0] Open time
    // [1] Open
    // [2] High
    // [3] Low
    // [4] Close
    // [5] Volume
    const formattedData: KLineData[] = data.map(candle => ({
      timestamp: candle[0],
      open: parseFloat(candle[1]),
      high: parseFloat(candle[2]),
      low: parseFloat(candle[3]),
      close: parseFloat(candle[4]),
      volume: parseFloat(candle[5]),
    }));

    if (formattedData.length > 0) {
      klineCache.set(cacheKey, formattedData);
    }
    return formattedData;

  } catch (error) {
    console.warn(`Binance fetch failed for ${cleanSymbol}:`, error);
    return [];
  }
};

/**
 * Chuyển đổi timeframe của TradingView/App sang định dạng của Binance
 */
export const mapTimeframeToBinance = (tf: string): BinanceInterval => {
  const mapping: Record<string, BinanceInterval> = {
    '1m': '1m',
    '5m': '5m',
    '15m': '15m',
    '30m': '30m',
    '1h': '1h',
    '4h': '4h',
    'D': '1d',
    'W': '1w',
    'M': '1M',
  };
  return mapping[tf] || '1d';
};

/**
 * Đăng ký WebSocket để nhận dữ liệu kline (nến) real-time
 */
export const subscribeBinanceKline = (
  symbol: string,
  interval: BinanceInterval,
  isFutures: boolean,
  callback: (kline: KLineData) => void
): (() => void) => {
  const cleanSymbol = cleanBinanceSymbol(symbol).toLowerCase();
  const wsUrl = isFutures
    ? `wss://fstream.binance.com/ws/${cleanSymbol}@kline_${interval}`
    : `wss://stream.binance.com:9443/ws/${cleanSymbol}@kline_${interval}`;

  let ws: WebSocket | null = null;
  try {
    ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.e === 'kline' && data.k) {
          const k = data.k;
          const newCandle: KLineData = {
            timestamp: k.t,
            open: parseFloat(k.o),
            high: parseFloat(k.h),
            low: parseFloat(k.l),
            close: parseFloat(k.c),
            volume: parseFloat(k.v),
          };
          callback(newCandle);
        }
      } catch (err) {
        console.error('WebSocket parse error:', err);
      }
    };

    ws.onerror = (err) => {
      console.warn('Binance WebSocket Error:', err);
    };
  } catch (e) {
    console.warn('Could not establish WebSocket for', cleanSymbol, e);
  }

  return () => {
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
      ws.close();
    }
  };
};
