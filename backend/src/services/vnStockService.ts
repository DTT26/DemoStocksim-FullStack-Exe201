export interface VnKLineData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface VnStockQuote {
  symbol: string;
  price: number;
  change: number;
  percent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  timestamp: number;
}

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

class VnStockService {
  private klineCache = new Map<string, CacheEntry<VnKLineData[]>>();
  private quoteCache = new Map<string, CacheEntry<VnStockQuote>>();

  /**
   * Chuyển đổi timeframe sang resolution của VNDirect UDF API
   */
  mapResolution(tf: string): string {
    const map: Record<string, string> = {
      '1m': '1',
      '5m': '5',
      '15m': '15',
      '30m': '30',
      '1h': '60',
      '4h': '60',
      'D': 'D',
      'W': 'D',
      'M': 'D'
    };
    return map[tf] || tf || 'D';
  }

  /**
   * Lấy lịch sử nến (Klines) cho cổ phiếu VN hoặc chỉ số VN-INDEX
   */
  async getKlines(
    symbol: string,
    resolution: string = 'D',
    fromSec?: number,
    toSec?: number
  ): Promise<VnKLineData[]> {
    const cleanSym = symbol.toUpperCase().trim();
    const res = this.mapResolution(resolution);
    const nowSec = Math.floor(Date.now() / 1000);

    // Tính mặc định khoảng thời gian nếu không truyền
    const to = toSec && toSec > 0 ? toSec : nowSec;
    let from = fromSec && fromSec > 0 ? fromSec : 0;
    if (!from) {
      if (res === '1') {
        from = to - 3 * 24 * 3600; // 3 ngày
      } else if (res === '5' || res === '15') {
        from = to - 14 * 24 * 3600; // 14 ngày
      } else if (res === '60') {
        from = to - 60 * 24 * 3600; // 60 ngày
      } else {
        from = to - 365 * 24 * 3600; // 1 năm
      }
    }

    const cacheKey = `${cleanSym}_${res}_${from}_${to}`;
    const cached = this.klineCache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }

    const url = `https://dchart-api.vndirect.com.vn/dchart/history?symbol=${cleanSym}&resolution=${res}&from=${from}&to=${to}`;

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Origin': 'https://dchart.vndirect.com.vn',
          'Referer': 'https://dchart.vndirect.com.vn/'
        }
      });

      if (!response.ok) {
        throw new Error(`VNDirect API responded with status ${response.status}`);
      }

      const json: any = await response.json();
      if (!json || !Array.isArray(json.t) || json.t.length === 0) {
        return [];
      }

      const klines: VnKLineData[] = [];
      const len = json.t.length;
      for (let i = 0; i < len; i++) {
        klines.push({
          timestamp: json.t[i] * 1000,
          open: Number(json.o[i]),
          high: Number(json.h[i]),
          low: Number(json.l[i]),
          close: Number(json.c[i]),
          volume: Number(json.v[i] || 0)
        });
      }

      // TTL: 15 giây cho intraday, 60 giây cho daily
      const ttlMs = (res === '1' || res === '5' || res === '15' || res === '60') ? 15000 : 60000;
      this.klineCache.set(cacheKey, {
        data: klines,
        expiry: Date.now() + ttlMs
      });

      return klines;
    } catch (error) {
      console.error(`[VnStockService] Failed to fetch klines for ${cleanSym}:`, error);
      return [];
    }
  }

  /**
   * Lấy báo giá snapshot mới nhất cho một danh sách mã cổ phiếu / chỉ số
   */
  async getQuotes(symbols: string[]): Promise<Record<string, VnStockQuote>> {
    const result: Record<string, VnStockQuote> = {};
    const toFetch: string[] = [];

    // Kiểm tra cache trước
    for (const sym of symbols) {
      const clean = sym.toUpperCase().trim();
      const cached = this.quoteCache.get(clean);
      if (cached && cached.expiry > Date.now()) {
        result[clean] = cached.data;
      } else {
        toFetch.push(clean);
      }
    }

    if (toFetch.length === 0) {
      return result;
    }

    const nowSec = Math.floor(Date.now() / 1000);
    const fromSec = nowSec - 30 * 24 * 3600; // Lấy 30 ngày gần nhất để chắc chắn có ít nhất 2 nến phiên

    // Lấy song song
    await Promise.all(
      toFetch.map(async (sym) => {
        try {
          const klines = await this.getKlines(sym, 'D', fromSec, nowSec);
          if (klines.length > 0) {
            const latest = klines[klines.length - 1];
            const prev = klines.length > 1 ? klines[klines.length - 2] : latest;
            const price = latest.close;
            const prevClose = prev.close || price;
            const change = Number((price - prevClose).toFixed(2));
            const percent = prevClose > 0 ? Number(((change / prevClose) * 100).toFixed(2)) : 0;

            const quote: VnStockQuote = {
              symbol: sym,
              price,
              change,
              percent,
              volume: latest.volume,
              high: latest.high,
              low: latest.low,
              open: latest.open,
              timestamp: latest.timestamp
            };

            this.quoteCache.set(sym, {
              data: quote,
              expiry: Date.now() + 30000 // Cache 30s
            });

            result[sym] = quote;
          }
        } catch (err) {
          console.warn(`[VnStockService] Error getting quote for ${sym}:`, err);
        }
      })
    );

    return result;
  }
}

export const vnStockService = new VnStockService();
