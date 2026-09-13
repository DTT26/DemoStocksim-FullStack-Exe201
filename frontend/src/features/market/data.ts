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
}

export const STOCKS: Stock[] = [
  // Cổ phiếu VN (HOSE/HNX)
  { symbol: 'FPT', name: 'FPT Corp', price: 115.50, change: 2.48, percent: 2.21, type: 'up', market: 'Cổ phiếu', exchange: 'HOSE' },
  { symbol: 'VCB', name: 'Vietcombank', price: 92.00, change: -0.47, percent: -0.51, type: 'down', market: 'Cổ phiếu', exchange: 'HOSE' },
  { symbol: 'HPG', name: 'Hoa Phat Group', price: 30.50, change: 1.20, percent: 4.09, type: 'up', market: 'Cổ phiếu', exchange: 'HOSE' },
  { symbol: 'SSI', name: 'SSI Securities', price: 38.20, change: 0.80, percent: 2.14, type: 'up', market: 'Cổ phiếu', exchange: 'HOSE' },
  { symbol: 'VIC', name: 'Vingroup', price: 45.00, change: -0.98, percent: -2.13, type: 'down', market: 'Cổ phiếu', exchange: 'HOSE' },

  // Crypto Spot (Binance)
  { symbol: 'BTCUSDT', name: 'Bitcoin', price: 64200.50, change: 1200.50, percent: 1.90, type: 'up', market: 'Tiền điện tử (Crypto)', exchange: 'BINANCE' },
  { symbol: 'ETHUSDT', name: 'Ethereum', price: 3450.20, change: -25.30, percent: -0.73, type: 'down', market: 'Tiền điện tử (Crypto)', exchange: 'BINANCE' },
  { symbol: 'BNBUSDT', name: 'BNB', price: 590.10, change: 5.40, percent: 0.92, type: 'up', market: 'Tiền điện tử (Crypto)', exchange: 'BINANCE' },
  { symbol: 'SOLUSDT', name: 'Solana', price: 145.30, change: -3.20, percent: -2.15, type: 'down', market: 'Tiền điện tử (Crypto)', exchange: 'BINANCE' },
  { symbol: 'XRPUSDT', name: 'Ripple', price: 0.58, change: 0.01, percent: 1.75, type: 'up', market: 'Tiền điện tử (Crypto)', exchange: 'BINANCE' },
  { symbol: 'ADAUSDT', name: 'Cardano', price: 0.45, change: -0.01, percent: -2.17, type: 'down', market: 'Tiền điện tử (Crypto)', exchange: 'BINANCE' },
  
  // Crypto Futures (Binance)
  { symbol: 'BTCUSDT.P', name: 'Bitcoin Perp', price: 64210.00, change: 1205.00, percent: 1.91, type: 'up', market: 'Tiền điện tử (Crypto)', exchange: 'BINANCE FUTURES', isFutures: true },
  { symbol: 'ETHUSDT.P', name: 'Ethereum Perp', price: 3451.50, change: -24.00, percent: -0.69, type: 'down', market: 'Tiền điện tử (Crypto)', exchange: 'BINANCE FUTURES', isFutures: true },
  { symbol: 'SOLUSDT.P', name: 'Solana Perp', price: 145.40, change: -3.10, percent: -2.09, type: 'down', market: 'Tiền điện tử (Crypto)', exchange: 'BINANCE FUTURES', isFutures: true },
  
  // Forex & Hàng hóa (Tượng trưng)
  { symbol: 'XAUUSD', name: 'Gold / US Dollar', price: 2350.50, change: 15.20, percent: 0.65, type: 'up', market: 'Hàng hóa', exchange: 'OANDA' },
  { symbol: 'EURUSD', name: 'Euro / US Dollar', price: 1.0850, change: -0.0020, percent: -0.18, type: 'down', market: 'Ngoại hối (Forex)', exchange: 'OANDA' },
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

export const generateOHLCV = (basePrice: number, count = 200, timeframe = 'D') => {
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
  const now = Date.now();
  const alignedNow = now - (now % intervalMs);
  let time = alignedNow - intervalMs * count;
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

  for (let i = 0; i < count; i++) {
    data[i].open = parseFloat((data[i].open + priceDiff).toFixed(2));
    data[i].high = parseFloat((data[i].high + priceDiff).toFixed(2));
    data[i].low = parseFloat((data[i].low + priceDiff).toFixed(2));
    data[i].close = parseFloat((data[i].close + priceDiff).toFixed(2));
    
    // Fix trường hợp nếu trừ đi làm giá bị âm (rất hiếm nhưng phòng hờ)
    if (data[i].low < 0.1) {
      const shiftUp = 0.1 - data[i].low;
      data[i].open = parseFloat((data[i].open + shiftUp).toFixed(2));
      data[i].high = parseFloat((data[i].high + shiftUp).toFixed(2));
      data[i].low = parseFloat((data[i].low + shiftUp).toFixed(2));
      data[i].close = parseFloat((data[i].close + shiftUp).toFixed(2));
    }
  }

  return data;
};
