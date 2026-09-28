import type { KLineData } from 'klinecharts';
import { fetchBinanceKlines, mapTimeframeToBinance, subscribeBinanceKline } from './binanceApi';

export const BINGX_SYMBOL_MAP: Record<string, string> = {
  // Hàng hóa (Commodities)
  'XAUUSD': 'NCCOGOLD2USD-USDT',
  'XAGUSD': 'NCCOXAG2USD-USDT',
  'USOIL': 'NCCO1OILWTI2USD-USDT',

  // Ngoại hối (Forex)
  'EURUSD': 'NCFXEUR2USD-USDT',
  'GBPUSD': 'NCFXGBP2USD-USDT',
  'USDJPY': 'NCFXUSD2JPY-USDT',
  'AUDUSD': 'NCFXAUD2USD-USDT',
  'USDCAD': 'NCFXUSD2CAD-USDT',

  // Cổ phiếu Mỹ (US Stocks)
  'AAPL': 'NCSKAAPL2USD-USDT',
  'MSFT': 'NCSKMSFT2USD-USDT',
  'TSLA': 'NCSKTSLA2USD-USDT',
  'NVDA': 'NCSKNVDA2USD-USDT',
  'KO': 'NCSKKO2USD-USDT',
  'JNJ': 'NCSKJNJ2USD-USDT',

  // Chỉ số (Indices)
  'SPX': 'NCSISP5002USD-USDT',
  'NDX': 'NCSINASDAQ1002USD-USDT',
  'DJI': 'NCSIDOWJONES2USD-USDT',
};

// Bản đồ ngược từ mã BingX sang mã chuẩn của hệ thống
export const BINGX_REVERSE_MAP: Record<string, string> = Object.entries(BINGX_SYMBOL_MAP).reduce(
  (acc, [stdSym, bingxSym]) => {
    acc[bingxSym] = stdSym;
    return acc;
  },
  {
    'XAUT-USDT': 'XAUUSD',
    'NCCOGOLD2USD-USDT': 'XAUUSD',
  } as Record<string, string>
);

export const mapTimeframeToBingX = (timeframe: string): string => {
  switch (timeframe) {
    case '1m': return '1m';
    case '3m': return '3m';
    case '5m': return '5m';
    case '15m': return '15m';
    case '30m': return '30m';
    case '1h': return '1h';
    case '2h': return '2h';
    case '4h': return '4h';
    case '6h': return '6h';
    case '12h': return '12h';
    case 'D': return '1d';
    case 'W': return '1w';
    case 'M': return '1M';
    default: return '1d';
  }
};

const bingxKlineCache = new Map<string, KLineData[]>();

export interface FetchMarketKlinesParams {
  symbol: string;
  timeframe: string;
  limit?: number;
  isFutures?: boolean;
  startTime?: number;
  endTime?: number;
}

/**
 * Lấy dữ liệu OHLCV từ sàn BingX (Open Public API)
 */
export const fetchBingXKlines = async ({
  symbol,
  timeframe,
  limit = 500,
  startTime,
  endTime,
}: {
  symbol: string;
  timeframe: string;
  limit?: number;
  startTime?: number;
  endTime?: number;
}): Promise<KLineData[]> => {
  const bingxSymbol = BINGX_SYMBOL_MAP[symbol.toUpperCase()] || symbol.replace('.P', '').replace('.SWAP', '').replace('USDT', '-USDT');
  const bingxInterval = mapTimeframeToBingX(timeframe);

  const cacheKey = `bingx-${bingxSymbol}-${bingxInterval}-${limit}-${startTime || 0}-${endTime || 'latest'}`;
  if (bingxKlineCache.has(cacheKey)) {
    return bingxKlineCache.get(cacheKey)!;
  }

  try {
    let url = `https://open-api.bingx.com/openApi/swap/v3/quote/klines?symbol=${encodeURIComponent(bingxSymbol)}&interval=${bingxInterval}&limit=${limit}`;
    if (startTime) url += `&startTime=${startTime}`;
    if (endTime) url += `&endTime=${endTime}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`BingX HTTP error: ${res.status}`);
    }

    const json = await res.json();
    if (json.code !== 0 || !Array.isArray(json.data) || json.data.length === 0) {
      return [];
    }

    // BingX trả về thứ tự từ Mới nhất -> Cũ nhất. KLineCharts cần Cũ nhất -> Mới nhất (ascending timestamp)
    const formattedData: KLineData[] = json.data
      .map((c: any) => ({
        timestamp: Number(c.time),
        open: parseFloat(c.open),
        high: parseFloat(c.high),
        low: parseFloat(c.low),
        close: parseFloat(c.close),
        volume: parseFloat(c.volume || '0'),
      }))
      .sort((a: KLineData, b: KLineData) => a.timestamp - b.timestamp);

    if (formattedData.length > 0) {
      bingxKlineCache.set(cacheKey, formattedData);
      return formattedData;
    }
  } catch (error) {
    console.warn(`[BingX] fetch failed for ${bingxSymbol}:`, error);
  }

  return [];
};

/**
 * Lấy dữ liệu nến thật từ tất cả các sàn (BingX cho Hàng hóa/Vàng/Forex/Cổ phiếu, Binance cho Crypto)
 * Có cơ chế tự động chuyển đổi qua lại (fallback) nếu sàn chính gặp trục trặc.
 */
export const fetchUnifiedKlines = async (params: FetchMarketKlinesParams): Promise<KLineData[]> => {
  const { symbol, timeframe, limit = 500, isFutures, startTime, endTime } = params;
  const upperSym = symbol.toUpperCase();

  // 1. Nếu là mã nằm trong danh mục TradFi của BingX (Vàng XAUUSD, Dầu, Ngoại hối, Cổ phiếu Mỹ, Chỉ số)
  if (BINGX_SYMBOL_MAP[upperSym]) {
    const bingxData = await fetchBingXKlines({ symbol: upperSym, timeframe, limit, startTime, endTime });
    if (bingxData && bingxData.length > 0) {
      return bingxData;
    }

    // Fallback riêng cho vàng XAUUSD sang Binance PAXGUSDT nếu BingX lỗi
    if (upperSym === 'XAUUSD') {
      const binanceInterval = mapTimeframeToBinance(timeframe);
      const binanceGold = await fetchBinanceKlines({
        symbol: 'PAXGUSDT',
        interval: binanceInterval,
        limit,
        isFutures: false,
        startTime,
        endTime,
      });
      if (binanceGold && binanceGold.length > 0) return binanceGold;
    }
  }

  // 2. Mặc định ưu tiên Binance cho Tiền điện tử (Crypto)
  const binanceInterval = mapTimeframeToBinance(timeframe);
  const binanceData = await fetchBinanceKlines({
    symbol,
    interval: binanceInterval,
    limit,
    isFutures,
    startTime,
    endTime,
  });

  if (binanceData && binanceData.length > 0) {
    return binanceData;
  }

  // 3. Fallback sang BingX nếu Binance không có hoặc bị lỗi
  const bingxFallbackData = await fetchBingXKlines({ symbol, timeframe, limit, startTime, endTime });
  if (bingxFallbackData && bingxFallbackData.length > 0) {
    return bingxFallbackData;
  }

  return [];
};

/**
 * Đăng ký luồng dữ liệu thời gian thực (Real-time Live Tick / Bar)
 * Binance dùng WebSocket stream, BingX dùng Polling cực nhanh (1.5s/lần)
 */
export const subscribeUnifiedBar = (
  symbol: string,
  timeframe: string,
  isFutures: boolean,
  onUpdate: (candle: KLineData) => void
): (() => void) => {
  const upperSym = symbol.toUpperCase();

  // Kênh BingX (Vàng, Dầu, Forex, Cổ phiếu, Chỉ số)
  if (BINGX_SYMBOL_MAP[upperSym]) {
    const bingxSymbol = BINGX_SYMBOL_MAP[upperSym];
    const bingxInterval = mapTimeframeToBingX(timeframe);
    let isActive = true;

    const pollLatest = async () => {
      if (!isActive) return;
      try {
        const url = `https://open-api.bingx.com/openApi/swap/v3/quote/klines?symbol=${encodeURIComponent(bingxSymbol)}&interval=${bingxInterval}&limit=1`;
        const res = await fetch(url);
        if (!res.ok) return;
        const json = await res.json();
        if (json.code === 0 && Array.isArray(json.data) && json.data.length > 0 && isActive) {
          const c = json.data[0];
          const candle: KLineData = {
            timestamp: Number(c.time),
            open: parseFloat(c.open),
            high: parseFloat(c.high),
            low: parseFloat(c.low),
            close: parseFloat(c.close),
            volume: parseFloat(c.volume || '0'),
          };
          onUpdate(candle);
        }
      } catch (err) {
        // bỏ qua lỗi polling mạng nhẹ
      }
    };

    // Chạy ngay lần đầu và định kỳ 1.5s
    pollLatest();
    const timerId = setInterval(pollLatest, 1500);

    return () => {
      isActive = false;
      clearInterval(timerId);
    };
  }

  // Kênh Binance WebSocket cho Crypto
  const binanceInterval = mapTimeframeToBinance(timeframe);
  return subscribeBinanceKline(symbol, binanceInterval, isFutures, onUpdate);
};

/**
 * Lấy giá thời gian thực của TOÀN BỘ thị trường (kết hợp cả Binance và BingX)
 * Dùng cho Watchlist, Bảng điều khiển, Quản lý lệnh chờ & TP/SL
 */
export const fetchAllMarketLivePrices = async (): Promise<Record<string, number>> => {
  const priceMap: Record<string, number> = {};

  try {
    const [spotRes, futRes, bingxRes] = await Promise.all([
      fetch('https://api.binance.com/api/v3/ticker/24hr').catch(() => null),
      fetch('https://fapi.binance.com/fapi/v1/ticker/24hr').catch(() => null),
      fetch('https://open-api.bingx.com/openApi/swap/v2/quote/ticker').catch(() => null),
    ]);

    // 1. Xử lý Binance Spot
    if (spotRes && spotRes.ok) {
      const spotData = await spotRes.json();
      if (Array.isArray(spotData)) {
        spotData.forEach((item: any) => {
          const p = parseFloat(item.lastPrice);
          if (!isNaN(p)) priceMap[item.symbol] = p;
        });
      }
    }

    // 2. Xử lý Binance Futures
    if (futRes && futRes.ok) {
      const futData = await futRes.json();
      if (Array.isArray(futData)) {
        futData.forEach((item: any) => {
          const p = parseFloat(item.lastPrice);
          if (!isNaN(p)) {
            priceMap[item.symbol] = p;
            priceMap[`${item.symbol}.P`] = p;
            priceMap[`${item.symbol}.SWAP`] = p;
          }
        });
      }
    }

    // 3. Xử lý BingX (Vàng, Dầu, Forex, Cổ phiếu, Chỉ số...)
    if (bingxRes && bingxRes.ok) {
      const bingxData = await bingxRes.json();
      if (bingxData.code === 0 && Array.isArray(bingxData.data)) {
        bingxData.data.forEach((item: any) => {
          const bingxSym = item.symbol;
          const price = parseFloat(item.lastPrice);
          if (isNaN(price)) return;

          // Map ngược về ký hiệu chuẩn của hệ thống (XAUUSD, EURUSD, AAPL...)
          const stdSym = BINGX_REVERSE_MAP[bingxSym];
          if (stdSym) {
            priceMap[stdSym] = price;
          }

          // Ký hiệu gốc của BingX
          priceMap[bingxSym] = price;
        });
      }
    }
  } catch (error) {
    console.error('Lỗi khi cập nhật giá thị trường trực tiếp:', error);
  }

  return priceMap;
};

/**
 * Đồng bộ giá và thông số 24h thực tế từ các sàn cho danh sách mã giao dịch
 */
export const syncLiveMarketData = async (stocksList: any[]): Promise<void> => {
  try {
    const [spotRes, futRes, bingxRes] = await Promise.all([
      fetch('https://api.binance.com/api/v3/ticker/24hr').catch(() => null),
      fetch('https://fapi.binance.com/fapi/v1/ticker/24hr').catch(() => null),
      fetch('https://open-api.bingx.com/openApi/swap/v2/quote/ticker').catch(() => null),
    ]);

    const tickerMap: Record<string, { price: number; change: number; percent: number; type: 'up' | 'down'; volume24h?: number }> = {};

    if (spotRes && spotRes.ok) {
      const spotData = await spotRes.json();
      if (Array.isArray(spotData)) {
        spotData.forEach((item: any) => {
          const price = parseFloat(item.lastPrice);
          const change = parseFloat(item.priceChange);
          const percent = parseFloat(item.priceChangePercent);
          if (!isNaN(price) && price > 0) {
            tickerMap[item.symbol] = {
              price,
              change: isNaN(change) ? 0 : change,
              percent: isNaN(percent) ? 0 : percent,
              type: change >= 0 ? 'up' : 'down',
              volume24h: parseFloat(item.quoteVolume) || 0,
            };
          }
        });
      }
    }

    if (futRes && futRes.ok) {
      const futData = await futRes.json();
      if (Array.isArray(futData)) {
        futData.forEach((item: any) => {
          const price = parseFloat(item.lastPrice);
          const change = parseFloat(item.priceChange);
          const percent = parseFloat(item.priceChangePercent);
          if (!isNaN(price) && price > 0) {
            const obj = {
              price,
              change: isNaN(change) ? 0 : change,
              percent: isNaN(percent) ? 0 : percent,
              type: (change >= 0 ? 'up' : 'down') as 'up' | 'down',
              volume24h: parseFloat(item.quoteVolume) || 0,
            };
            tickerMap[`${item.symbol}.P`] = obj;
            tickerMap[`${item.symbol}.SWAP`] = obj;
            if (!tickerMap[item.symbol]) tickerMap[item.symbol] = obj;
          }
        });
      }
    }

    if (bingxRes && bingxRes.ok) {
      const bingxData = await bingxRes.json();
      if (bingxData.code === 0 && Array.isArray(bingxData.data)) {
        bingxData.data.forEach((item: any) => {
          const price = parseFloat(item.lastPrice);
          const change = parseFloat(item.priceChange);
          const percent = parseFloat(item.priceChangePercent);
          if (!isNaN(price) && price > 0) {
            const bingxSym = item.symbol;
            const stdSym = BINGX_REVERSE_MAP[bingxSym] || bingxSym;
            const obj = {
              price,
              change: isNaN(change) ? 0 : change,
              percent: isNaN(percent) ? 0 : percent,
              type: (change >= 0 ? 'up' : 'down') as 'up' | 'down',
              volume24h: parseFloat(item.quoteVolume) || 0,
            };
            tickerMap[stdSym] = obj;
            tickerMap[bingxSym] = obj;
          }
        });
      }
    }

    stocksList.forEach(stock => {
      const t = tickerMap[stock.symbol];
      if (t && t.price > 0) {
        stock.price = t.price;
        stock.change = t.change;
        stock.percent = t.percent;
        stock.type = t.type;
        if (t.volume24h && t.volume24h > 0) {
          stock.volume24h = t.volume24h;
        }
      }
    });
  } catch (err) {
    // lỗi nhẹ khi sync nền
  }
};

