export type MarketCategory = 'Tiền điện tử (Crypto)' | 'Cổ phiếu' | 'Hàng hóa' | 'Ngoại hối (Forex)' | 'Chỉ số';

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  percent: number;
  type: 'up' | 'down';
  market: MarketCategory;
  exchange: string;
  isFutures?: boolean;
  leverageInfo: {
    max: number;
    marks: number[];
  };
}

export const STOCKS: Stock[] = [
  // Cổ phiếu VN (HOSE/HNX)
  { symbol: 'FPT', name: 'FPT Corp', price: 115.50, change: 2.48, percent: 2.21, type: 'up', market: 'Cổ phiếu', exchange: 'HOSE', leverageInfo: { max: 20, marks: [5, 10, 15, 20] } },
  { symbol: 'VCB', name: 'Vietcombank', price: 92.00, change: -0.47, percent: -0.51, type: 'down', market: 'Cổ phiếu', exchange: 'HOSE', leverageInfo: { max: 20, marks: [5, 10, 15, 20] } },
  { symbol: 'HPG', name: 'Hoa Phat Group', price: 30.50, change: 1.20, percent: 4.09, type: 'up', market: 'Cổ phiếu', exchange: 'HOSE', leverageInfo: { max: 20, marks: [5, 10, 15, 20] } },
  { symbol: 'SSI', name: 'SSI Securities', price: 38.20, change: 0.80, percent: 2.14, type: 'up', market: 'Cổ phiếu', exchange: 'HOSE', leverageInfo: { max: 20, marks: [5, 10, 15, 20] } },
  { symbol: 'VIC', name: 'Vingroup', price: 45.00, change: -0.98, percent: -2.13, type: 'down', market: 'Cổ phiếu', exchange: 'HOSE', leverageInfo: { max: 20, marks: [5, 10, 15, 20] } },
  { symbol: 'BSR', name: 'Binh Son Refining', price: 19.50, change: 0.20, percent: 1.04, type: 'up', market: 'Cổ phiếu', exchange: 'UPCOM', leverageInfo: { max: 20, marks: [5, 10, 15, 20] } },
  { symbol: 'VGI', name: 'Viettel Global', price: 82.10, change: -1.40, percent: -1.68, type: 'down', market: 'Cổ phiếu', exchange: 'UPCOM', leverageInfo: { max: 20, marks: [5, 10, 15, 20] } },

  // Crypto Spot (Binance)
  { symbol: 'BTCUSDT', name: 'Bitcoin', price: 64200.50, change: 1200.50, percent: 1.90, type: 'up', market: 'Tiền điện tử (Crypto)', exchange: 'BINANCE', leverageInfo: { max: 125, marks: [25, 50, 75, 100, 125] } },
  { symbol: 'ETHUSDT', name: 'Ethereum', price: 3450.20, change: -25.30, percent: -0.73, type: 'down', market: 'Tiền điện tử (Crypto)', exchange: 'BINANCE', leverageInfo: { max: 100, marks: [25, 50, 75, 100] } },
  { symbol: 'BNBUSDT', name: 'BNB', price: 590.10, change: 5.40, percent: 0.92, type: 'up', market: 'Tiền điện tử (Crypto)', exchange: 'BINANCE', leverageInfo: { max: 75, marks: [25, 50, 75] } },
  { symbol: 'SOLUSDT', name: 'Solana', price: 145.30, change: -3.20, percent: -2.15, type: 'down', market: 'Tiền điện tử (Crypto)', exchange: 'BINANCE', leverageInfo: { max: 75, marks: [25, 50, 75] } },
  { symbol: 'XRPUSDT', name: 'Ripple', price: 0.58, change: 0.01, percent: 1.75, type: 'up', market: 'Tiền điện tử (Crypto)', exchange: 'BINANCE', leverageInfo: { max: 50, marks: [10, 25, 50] } },
  { symbol: 'ADAUSDT', name: 'Cardano', price: 0.45, change: -0.01, percent: -2.17, type: 'down', market: 'Tiền điện tử (Crypto)', exchange: 'BINANCE', leverageInfo: { max: 50, marks: [10, 25, 50] } },
  
  // Crypto Spot (Other Exchanges)
  { symbol: 'DOGEUSDT', name: 'Dogecoin', price: 0.15, change: 0.02, percent: 15.3, type: 'up', market: 'Tiền điện tử (Crypto)', exchange: 'OKX', leverageInfo: { max: 75, marks: [25, 50, 75] } },
  { symbol: 'DOTUSDT', name: 'Polkadot', price: 7.20, change: -0.15, percent: -2.04, type: 'down', market: 'Tiền điện tử (Crypto)', exchange: 'BYBIT', leverageInfo: { max: 50, marks: [10, 25, 50] } },
  { symbol: 'LINKUSD', name: 'Chainlink', price: 18.50, change: 0.80, percent: 4.51, type: 'up', market: 'Tiền điện tử (Crypto)', exchange: 'COINBASE', leverageInfo: { max: 10, marks: [2, 5, 10] } },
  { symbol: 'MATICUSDT', name: 'Polygon', price: 0.75, change: 0.05, percent: 7.14, type: 'up', market: 'Tiền điện tử (Crypto)', exchange: 'KRAKEN', leverageInfo: { max: 20, marks: [5, 10, 15, 20] } },
  { symbol: 'LDOUSDT', name: 'Lido DAO', price: 2.10, change: -0.12, percent: -5.40, type: 'down', market: 'Tiền điện tử (Crypto)', exchange: 'KUCOIN', leverageInfo: { max: 20, marks: [5, 10, 15, 20] } },
  { symbol: 'SHIBUSDT', name: 'Shiba Inu', price: 0.000015, change: 0.000001, percent: 5.5, type: 'up', market: 'Tiền điện tử (Crypto)', exchange: 'HTX', leverageInfo: { max: 20, marks: [5, 10, 15, 20] } },
  { symbol: 'TRXUSDT', name: 'TRON', price: 0.12, change: 0.01, percent: 9.09, type: 'up', market: 'Tiền điện tử (Crypto)', exchange: 'HTX', leverageInfo: { max: 50, marks: [10, 25, 50] } },
  
  // Crypto Futures (Binance & Others)
  { symbol: 'BTCUSDT.P', name: 'Bitcoin Perp', price: 64210.00, change: 1205.00, percent: 1.91, type: 'up', market: 'Tiền điện tử (Crypto)', exchange: 'BINANCE FUTURES', isFutures: true, leverageInfo: { max: 125, marks: [25, 50, 75, 100, 125] } },
  { symbol: 'ETHUSDT.P', name: 'Ethereum Perp', price: 3451.50, change: -24.00, percent: -0.69, type: 'down', market: 'Tiền điện tử (Crypto)', exchange: 'BINANCE FUTURES', isFutures: true, leverageInfo: { max: 100, marks: [25, 50, 75, 100] } },
  { symbol: 'SOLUSDT.P', name: 'Solana Perp', price: 145.40, change: -3.10, percent: -2.09, type: 'down', market: 'Tiền điện tử (Crypto)', exchange: 'BINANCE FUTURES', isFutures: true, leverageInfo: { max: 75, marks: [25, 50, 75] } },
  { symbol: '1000PEPEUSDT.P', name: 'Pepe Perp', price: 0.0085, change: 0.0012, percent: 16.4, type: 'up', market: 'Tiền điện tử (Crypto)', exchange: 'BYBIT FUTURES', isFutures: true, leverageInfo: { max: 50, marks: [10, 25, 50] } },
  { symbol: 'AVAXUSDT.SWAP', name: 'Avalanche Swap', price: 35.80, change: -1.20, percent: -3.24, type: 'down', market: 'Tiền điện tử (Crypto)', exchange: 'OKX FUTURES', isFutures: true, leverageInfo: { max: 75, marks: [25, 50, 75] } },
  { symbol: 'XRPUSDT.P', name: 'Ripple Perp', price: 0.585, change: 0.015, percent: 2.63, type: 'up', market: 'Tiền điện tử (Crypto)', exchange: 'KUCOIN', isFutures: true, leverageInfo: { max: 50, marks: [10, 25, 50] } },
  
  // Forex & Hàng hóa (Tượng trưng)
  { symbol: 'XAUUSD', name: 'Gold / US Dollar', price: 2350.50, change: 15.20, percent: 0.65, type: 'up', market: 'Hàng hóa', exchange: 'OANDA', leverageInfo: { max: 200, marks: [50, 100, 150, 200] } },
  { symbol: 'XAGUSD', name: 'Silver / US Dollar', price: 31.20, change: 0.45, percent: 1.46, type: 'up', market: 'Hàng hóa', exchange: 'OANDA', leverageInfo: { max: 100, marks: [25, 50, 75, 100] } },
  { symbol: 'USOIL', name: 'WTI Crude Oil', price: 82.50, change: -1.10, percent: -1.31, type: 'down', market: 'Hàng hóa', exchange: 'NYMEX', leverageInfo: { max: 100, marks: [25, 50, 75, 100] } },
  { symbol: 'EURUSD', name: 'Euro / US Dollar', price: 1.0850, change: -0.0020, percent: -0.18, type: 'down', market: 'Ngoại hối (Forex)', exchange: 'OANDA', leverageInfo: { max: 500, marks: [100, 200, 300, 400, 500] } },
  { symbol: 'GBPUSD', name: 'British Pound / USD', price: 1.2640, change: 0.0015, percent: 0.12, type: 'up', market: 'Ngoại hối (Forex)', exchange: 'OANDA', leverageInfo: { max: 500, marks: [100, 200, 300, 400, 500] } },
  { symbol: 'USDJPY', name: 'US Dollar / Yen', price: 151.20, change: 0.85, percent: 0.56, type: 'up', market: 'Ngoại hối (Forex)', exchange: 'OANDA', leverageInfo: { max: 500, marks: [100, 200, 300, 400, 500] } },
  { symbol: 'AUDUSD', name: 'Australian Dollar / USD', price: 0.6540, change: -0.0030, percent: -0.46, type: 'down', market: 'Ngoại hối (Forex)', exchange: 'FOREX.COM', leverageInfo: { max: 400, marks: [50, 100, 200, 400] } },
  { symbol: 'USDCAD', name: 'US Dollar / Canadian', price: 1.3520, change: 0.0010, percent: 0.07, type: 'up', market: 'Ngoại hối (Forex)', exchange: 'FOREX.COM', leverageInfo: { max: 400, marks: [50, 100, 200, 400] } },

  // Cổ phiếu Mỹ (US Stocks)
  { symbol: 'AAPL', name: 'Apple Inc.', price: 175.50, change: 2.10, percent: 1.21, type: 'up', market: 'Cổ phiếu', exchange: 'NASDAQ', leverageInfo: { max: 20, marks: [5, 10, 15, 20] } },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 420.30, change: 5.40, percent: 1.30, type: 'up', market: 'Cổ phiếu', exchange: 'NASDAQ', leverageInfo: { max: 20, marks: [5, 10, 15, 20] } },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 190.20, change: -4.50, percent: -2.31, type: 'down', market: 'Cổ phiếu', exchange: 'NASDAQ', leverageInfo: { max: 20, marks: [5, 10, 15, 20] } },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 880.50, change: 15.20, percent: 1.76, type: 'up', market: 'Cổ phiếu', exchange: 'NASDAQ', leverageInfo: { max: 20, marks: [5, 10, 15, 20] } },
  { symbol: 'KO', name: 'Coca-Cola Co.', price: 59.80, change: 0.45, percent: 0.76, type: 'up', market: 'Cổ phiếu', exchange: 'NYSE', leverageInfo: { max: 20, marks: [5, 10, 15, 20] } },
  { symbol: 'JNJ', name: 'Johnson & Johnson', price: 155.30, change: -1.20, percent: -0.77, type: 'down', market: 'Cổ phiếu', exchange: 'NYSE', leverageInfo: { max: 20, marks: [5, 10, 15, 20] } },

  // Chỉ số (Indices)
  { symbol: 'SPX', name: 'S&P 500', price: 5120.50, change: 25.40, percent: 0.50, type: 'up', market: 'Chỉ số', exchange: 'CME', leverageInfo: { max: 100, marks: [25, 50, 75, 100] } },
  { symbol: 'NDX', name: 'Nasdaq 100', price: 18050.20, change: 110.50, percent: 0.62, type: 'up', market: 'Chỉ số', exchange: 'CME', leverageInfo: { max: 100, marks: [25, 50, 75, 100] } },
  { symbol: 'DJI', name: 'Dow Jones', price: 39100.80, change: -45.20, percent: -0.12, type: 'down', market: 'Chỉ số', exchange: 'CBOT', leverageInfo: { max: 100, marks: [25, 50, 75, 100] } },
];



export const TIMEFRAMES = ['1m', '5m', '15m', '30m', '1h', '4h', 'D', 'W', 'M'];

/** Trả về khoảng cách timestamp (ms) tương ứng với timeframe */
const timeframeToMs = (timeframe: string): number => {
  if (timeframe.endsWith('m')) return parseInt(timeframe) * 60 * 1000;
  if (timeframe.endsWith('h')) return parseInt(timeframe) * 60 * 60 * 1000;
  if (timeframe === 'W') return 7 * 24 * 60 * 60 * 1000;
  if (timeframe === 'M') return 30 * 24 * 60 * 60 * 1000;
  return 24 * 60 * 60 * 1000; // 'D' và mặc định
};

/**
 * Số phút tương đương của 1 candle theo timeframe.
 * Dùng để scale volume & volatility cho thực tế hơn.
 *   1m  → 1      | 5m  → 5   | 15m → 15  | 30m → 30
 *   1h  → 60     | 4h  → 240
 *   D   → 390 (6.5 giờ giao dịch) | W → 1950 | M → 7800
 */
const timeframeMinutes = (timeframe: string): number => {
  if (timeframe.endsWith('m')) return parseInt(timeframe);
  if (timeframe.endsWith('h')) return parseInt(timeframe) * 60;
  if (timeframe === 'W') return 390 * 5;
  if (timeframe === 'M') return 390 * 20;
  return 390; // 'D'
};

export const getPricePrecision = (price: number): number => {
  if (!price || price <= 0) return 2;
  if (price < 0.0001) return 8; // e.g. SHIB: 0.000015
  if (price < 0.01) return 6;   // e.g. PEPE: 0.0085
  if (price < 0.1) return 5;    // e.g. DOGE: 0.0835
  if (price < 1) return 4;      // e.g. ADA: 0.4500, XRP: 0.5800
  if (price < 10) return 4;     // e.g. EURUSD: 1.0850
  if (price < 100) return 3;
  return 2;                     // e.g. BTC: 64200.50, FPT: 115.50
};

export const generateOHLCV = (basePrice: number, count = 200, timeframe = 'D', endTime?: number) => {
  if (count <= 0) return [];
  const intervalMs = timeframeToMs(timeframe);

  // Volume cơ sở cho candle 1 phút: 5000–30000 cp
  // Scale tỉ lệ với số phút trong candle (candle D ~ 390 phút)
  const tfMin = timeframeMinutes(timeframe);
  const baseVolMin = 5_000;
  const baseVolMax = 30_000;

  // Volatility giảm theo căn bậc hai của timeframe (sqrt scaling)
  // Candle 1m biến động ít hơn, candle D biến động nhiều hơn
  const volScale = Math.sqrt(tfMin / 390); // tương đối so với ngày

  const data = [];
  // Làm tròn thời gian hiện tại về đầu khoảng interval để các mốc thời gian chẵn (VD: 09:00, 09:30)
  const now = endTime ?? Date.now();
  const alignedNow = now - (now % intervalMs);
  let time = alignedNow - intervalMs * (count - 1);
  let close = basePrice;

  for (let i = 0; i < count; i++) {
    const swing = basePrice * 0.015 * volScale;
    const wick  = basePrice * 0.008 * volScale;

    const open  = close + (Math.random() - 0.5) * swing;
    const high  = Math.max(open, close) + Math.random() * wick;
    const low   = Math.min(open, close) - Math.random() * wick;
    close = open + (Math.random() - 0.5) * basePrice * 0.012 * volScale;

    // Volume: base/phút × số phút × nhiễu ngẫu nhiên [0.5, 1.5]
    const volPerMinute = baseVolMin + Math.random() * (baseVolMax - baseVolMin);
    const volume = volPerMinute * tfMin * (0.5 + Math.random());

    data.push({
      timestamp: time,
      open,
      high,
      low,
      close,
      volume: Math.round(volume),
    });
    time += intervalMs;
  }

  // Dịch chuyển lại toàn bộ giá trị để nến cuối cùng khớp chính xác với basePrice
  const lastClose = data[data.length - 1].close;
  const priceDiff = basePrice - lastClose;
  const precision = getPricePrecision(basePrice);

  for (let i = 0; i < count; i++) {
    data[i].open = parseFloat((data[i].open + priceDiff).toFixed(precision));
    data[i].high = parseFloat((data[i].high + priceDiff).toFixed(precision));
    data[i].low = parseFloat((data[i].low + priceDiff).toFixed(precision));
    data[i].close = parseFloat((data[i].close + priceDiff).toFixed(precision));
    
    // Fix trường hợp nếu trừ đi làm giá bị âm hoặc bằng 0
    if (data[i].low <= 0) {
      const minPositive = Math.pow(10, -precision);
      const shiftUp = minPositive - data[i].low;
      data[i].open = parseFloat((data[i].open + shiftUp).toFixed(precision));
      data[i].high = parseFloat((data[i].high + shiftUp).toFixed(precision));
      data[i].low = parseFloat((data[i].low + shiftUp).toFixed(precision));
      data[i].close = parseFloat((data[i].close + shiftUp).toFixed(precision));
    }
  }

  return data;
};
