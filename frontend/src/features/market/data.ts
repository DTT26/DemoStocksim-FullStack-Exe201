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
  volume24h?: number;
}

export const formatVolume = (vol?: number): string => {
  if (!vol || vol <= 0) return '--';
  if (vol >= 1_000_000_000_000) return (vol / 1_000_000_000_000).toFixed(2) + 'T';
  if (vol >= 1_000_000_000) return (vol / 1_000_000_000).toFixed(2) + 'B';
  if (vol >= 1_000_000) return (vol / 1_000_000).toFixed(2) + 'M';
  if (vol >= 1_000) return (vol / 1_000).toFixed(1) + 'K';
  return vol.toLocaleString('vi-VN');
};

export const STOCKS: Stock[] = [

  // Crypto Spot (Binance)
  { symbol: 'BTCUSDT', name: 'Bitcoin', price: 83090.00, change: -1405.00, percent: -1.66, type: 'down', market: 'Tiền điện tử (Crypto)', exchange: 'BINANCE', leverageInfo: { max: 125, marks: [25, 50, 75, 100, 125] }, volume24h: 28_540_000_000 },
  { symbol: 'ETHUSDT', name: 'Ethereum', price: 2667.00, change: -19.80, percent: -0.74, type: 'down', market: 'Tiền điện tử (Crypto)', exchange: 'BINANCE', leverageInfo: { max: 100, marks: [25, 50, 75, 100] }, volume24h: 14_210_000_000 },
  { symbol: 'BNBUSDT', name: 'BNB', price: 759.50, change: -16.10, percent: -2.08, type: 'down', market: 'Tiền điện tử (Crypto)', exchange: 'BINANCE', leverageInfo: { max: 75, marks: [25, 50, 75] }, volume24h: 1_250_000_000 },
  { symbol: 'SOLUSDT', name: 'Solana', price: 118.15, change: -3.42, percent: -2.81, type: 'down', market: 'Tiền điện tử (Crypto)', exchange: 'BINANCE', leverageInfo: { max: 75, marks: [25, 50, 75] }, volume24h: 4_850_000_000 },
  { symbol: 'XRPUSDT', name: 'Ripple', price: 1.4865, change: -0.0281, percent: -1.86, type: 'down', market: 'Tiền điện tử (Crypto)', exchange: 'BINANCE', leverageInfo: { max: 50, marks: [10, 25, 50] }, volume24h: 1_850_000_000 },
  { symbol: 'ADAUSDT', name: 'Cardano', price: 0.2412, change: -0.0117, percent: -4.63, type: 'down', market: 'Tiền điện tử (Crypto)', exchange: 'BINANCE', leverageInfo: { max: 50, marks: [10, 25, 50] }, volume24h: 640_000_000 },
  
  // Crypto Spot (Other Exchanges)
  { symbol: 'DOGEUSDT', name: 'Dogecoin', price: 0.09252, change: -0.00403, percent: -4.17, type: 'down', market: 'Tiền điện tử (Crypto)', exchange: 'OKX / BINANCE', leverageInfo: { max: 75, marks: [25, 50, 75] }, volume24h: 2_150_000_000 },
  { symbol: 'DOTUSDT', name: 'Polkadot', price: 1.159, change: -0.066, percent: -5.39, type: 'down', market: 'Tiền điện tử (Crypto)', exchange: 'BYBIT / BINANCE', leverageInfo: { max: 50, marks: [10, 25, 50] }, volume24h: 320_000_000 },
  { symbol: 'LINKUSDT', name: 'Chainlink', price: 14.19, change: 0.17, percent: 1.25, type: 'up', market: 'Tiền điện tử (Crypto)', exchange: 'BINANCE', leverageInfo: { max: 50, marks: [10, 25, 50] }, volume24h: 510_000_000 },
  { symbol: 'MATICUSDT', name: 'Polygon', price: 0.3794, change: -0.0011, percent: -0.29, type: 'down', market: 'Tiền điện tử (Crypto)', exchange: 'KRAKEN / BINANCE', leverageInfo: { max: 20, marks: [5, 10, 15, 20] }, volume24h: 420_000_000 },
  { symbol: 'LDOUSDT', name: 'Lido DAO', price: 0.4456, change: -0.0298, percent: -6.27, type: 'down', market: 'Tiền điện tử (Crypto)', exchange: 'KUCOIN / BINANCE', leverageInfo: { max: 20, marks: [5, 10, 15, 20] }, volume24h: 230_000_000 },
  { symbol: 'SHIBUSDT', name: 'Shiba Inu', price: 0.0000056, change: -0.00000028, percent: -4.76, type: 'down', market: 'Tiền điện tử (Crypto)', exchange: 'HTX / BINANCE', leverageInfo: { max: 20, marks: [5, 10, 15, 20] }, volume24h: 890_000_000 },
  { symbol: 'TRXUSDT', name: 'TRON', price: 0.3340, change: 0.0003, percent: 0.09, type: 'up', market: 'Tiền điện tử (Crypto)', exchange: 'HTX / BINANCE', leverageInfo: { max: 50, marks: [10, 25, 50] }, volume24h: 670_000_000 },
  
  // Crypto Futures (Binance & Others)
  { symbol: 'BTCUSDT.P', name: 'Bitcoin Perp', price: 83054.00, change: -1425.00, percent: -1.69, type: 'down', market: 'Tiền điện tử (Crypto)', exchange: 'BINANCE FUTURES', isFutures: true, leverageInfo: { max: 125, marks: [25, 50, 75, 100, 125] }, volume24h: 42_500_000_000 },
  { symbol: 'ETHUSDT.P', name: 'Ethereum Perp', price: 2666.50, change: -20.40, percent: -0.76, type: 'down', market: 'Tiền điện tử (Crypto)', exchange: 'BINANCE FUTURES', isFutures: true, leverageInfo: { max: 100, marks: [25, 50, 75, 100] }, volume24h: 21_800_000_000 },
  { symbol: 'SOLUSDT.P', name: 'Solana Perp', price: 118.10, change: -3.50, percent: -2.88, type: 'down', market: 'Tiền điện tử (Crypto)', exchange: 'BINANCE FUTURES', isFutures: true, leverageInfo: { max: 75, marks: [25, 50, 75] }, volume24h: 7_600_000_000 },
  { symbol: '1000PEPEUSDT.P', name: 'Pepe Perp', price: 0.00415, change: -0.00019, percent: -4.42, type: 'down', market: 'Tiền điện tử (Crypto)', exchange: 'BYBIT / BINANCE FUTURES', isFutures: true, leverageInfo: { max: 50, marks: [10, 25, 50] }, volume24h: 3_450_000_000 },
  { symbol: 'AVAXUSDT.SWAP', name: 'Avalanche Swap', price: 10.25, change: -0.68, percent: -6.29, type: 'down', market: 'Tiền điện tử (Crypto)', exchange: 'OKX / BINANCE FUTURES', isFutures: true, leverageInfo: { max: 75, marks: [25, 50, 75] }, volume24h: 1_120_000_000 },
  { symbol: 'XRPUSDT.P', name: 'Ripple Perp', price: 1.4863, change: -0.0287, percent: -1.89, type: 'down', market: 'Tiền điện tử (Crypto)', exchange: 'KUCOIN / BINANCE FUTURES', isFutures: true, leverageInfo: { max: 50, marks: [10, 25, 50] }, volume24h: 2_340_000_000 },
  
  // Forex & Hàng hóa (Thực tế BingX & Global)
  { symbol: 'XAUUSD', name: 'Gold / US Dollar', price: 4124.50, change: -160.80, percent: -3.75, type: 'down', market: 'Hàng hóa', exchange: 'BINGX / OANDA', leverageInfo: { max: 200, marks: [50, 100, 150, 200] }, volume24h: 35_000_000_000 },
  { symbol: 'XAGUSD', name: 'Silver / US Dollar', price: 61.68, change: 0.85, percent: 1.40, type: 'up', market: 'Hàng hóa', exchange: 'BINGX / OANDA', leverageInfo: { max: 100, marks: [25, 50, 75, 100] }, volume24h: 8_500_000_000 },
  { symbol: 'USOIL', name: 'WTI Crude Oil', price: 94.40, change: -1.10, percent: -1.15, type: 'down', market: 'Hàng hóa', exchange: 'BINGX / NYMEX', leverageInfo: { max: 100, marks: [25, 50, 75, 100] }, volume24h: 18_000_000_000 },
  { symbol: 'EURUSD', name: 'Euro / US Dollar', price: 1.1378, change: 0.0012, percent: 0.11, type: 'up', market: 'Ngoại hối (Forex)', exchange: 'BINGX / OANDA', leverageInfo: { max: 500, marks: [100, 200, 300, 400, 500] }, volume24h: 85_000_000_000 },
  { symbol: 'GBPUSD', name: 'British Pound / USD', price: 1.3236, change: 0.0025, percent: 0.19, type: 'up', market: 'Ngoại hối (Forex)', exchange: 'BINGX / OANDA', leverageInfo: { max: 500, marks: [100, 200, 300, 400, 500] }, volume24h: 42_000_000_000 },
  { symbol: 'USDJPY', name: 'US Dollar / Yen', price: 157.76, change: 0.85, percent: 0.54, type: 'up', market: 'Ngoại hối (Forex)', exchange: 'BINGX / OANDA', leverageInfo: { max: 500, marks: [100, 200, 300, 400, 500] }, volume24h: 55_000_000_000 },
  { symbol: 'AUDUSD', name: 'Australian Dollar / USD', price: 0.7019, change: -0.0018, percent: -0.26, type: 'down', market: 'Ngoại hối (Forex)', exchange: 'BINGX / FOREX.COM', leverageInfo: { max: 400, marks: [50, 100, 200, 400] }, volume24h: 19_000_000_000 },
  { symbol: 'USDCAD', name: 'US Dollar / Canadian', price: 1.4154, change: 0.0010, percent: 0.07, type: 'up', market: 'Ngoại hối (Forex)', exchange: 'BINGX / FOREX.COM', leverageInfo: { max: 400, marks: [50, 100, 200, 400] }, volume24h: 14_000_000_000 },

  // Cổ phiếu Mỹ (US Stocks)
  { symbol: 'AAPL', name: 'Apple Inc.', price: 340.62, change: 3.50, percent: 1.04, type: 'up', market: 'Cổ phiếu', exchange: 'NASDAQ / BINGX', leverageInfo: { max: 20, marks: [5, 10, 15, 20] }, volume24h: 8_500_000_000 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 517.07, change: 6.20, percent: 1.21, type: 'up', market: 'Cổ phiếu', exchange: 'NASDAQ / BINGX', leverageInfo: { max: 20, marks: [5, 10, 15, 20] }, volume24h: 6_800_000_000 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 370.11, change: -4.50, percent: -1.20, type: 'down', market: 'Cổ phiếu', exchange: 'NASDAQ / BINGX', leverageInfo: { max: 20, marks: [5, 10, 15, 20] }, volume24h: 12_400_000_000 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 224.08, change: 5.20, percent: 2.38, type: 'up', market: 'Cổ phiếu', exchange: 'NASDAQ / BINGX', leverageInfo: { max: 20, marks: [5, 10, 15, 20] }, volume24h: 15_200_000_000 },
  { symbol: 'KO', name: 'Coca-Cola Co.', price: 88.11, change: 0.45, percent: 0.51, type: 'up', market: 'Cổ phiếu', exchange: 'NYSE / BINGX', leverageInfo: { max: 20, marks: [5, 10, 15, 20] }, volume24h: 1_200_000_000 },
  { symbol: 'JNJ', name: 'Johnson & Johnson', price: 272.40, change: -1.20, percent: -0.44, type: 'down', market: 'Cổ phiếu', exchange: 'NYSE / BINGX', leverageInfo: { max: 20, marks: [5, 10, 15, 20] }, volume24h: 980_000_000 },

  // Chỉ số (Indices)
  { symbol: 'SPX', name: 'S&P 500', price: 7711.70, change: 35.40, percent: 0.46, type: 'up', market: 'Chỉ số', exchange: 'CME / BINGX', leverageInfo: { max: 100, marks: [25, 50, 75, 100] }, volume24h: 45_000_000_000 },
  { symbol: 'NDX', name: 'Nasdaq 100', price: 30355.49, change: 180.50, percent: 0.60, type: 'up', market: 'Chỉ số', exchange: 'CME / BINGX', leverageInfo: { max: 100, marks: [25, 50, 75, 100] }, volume24h: 38_000_000_000 },
  { symbol: 'DJI', name: 'Dow Jones', price: 51632.40, change: 120.20, percent: 0.23, type: 'up', market: 'Chỉ số', exchange: 'CBOT / BINGX', leverageInfo: { max: 100, marks: [25, 50, 75, 100] }, volume24h: 22_000_000_000 },
];



export const TIMEFRAMES = ['1m', '5m', '15m', '30m', '1h', '4h', 'D', 'W', 'M'];

/** Trả về khoảng cách timestamp (ms) tương ứng với timeframe */
export const timeframeToMs = (timeframe: string): number => {
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
  const volScale = Math.sqrt(tfMin / 390);

  const data = [];
  // Làm tròn thời gian hiện tại về đầu khoảng interval để các mốc thời gian chẵn (VD: 09:00, 09:30)
  const now = endTime ?? Date.now();
  const alignedNow = now - (now % intervalMs);
  let time = alignedNow - intervalMs * (count - 1);
  let currentPrice = Math.max(1, basePrice);
  const precision = getPricePrecision(basePrice);

  for (let i = 0; i < count; i++) {
    const swing = currentPrice * 0.012 * volScale;
    const wick = currentPrice * 0.006 * volScale;

    // Nến sau LUÔN mở cửa tại đúng giá đóng cửa của nến trước (không bị hở/rời rạc)
    const open = currentPrice;
    const bodyDelta = (Math.random() - 0.495) * swing;
    const close = Math.max(0.0001, open + bodyDelta);

    const upperWick = Math.random() * wick;
    const lowerWick = Math.random() * wick;
    const high = Math.max(open, close) + upperWick;
    const low = Math.max(0.0001, Math.min(open, close) - lowerWick);

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

    currentPrice = close;
    time += intervalMs;
  }

  // Chuẩn hóa theo tỉ lệ để nến cuối cùng khớp chính xác với basePrice và giữ tính liên tục hoàn hảo
  const lastClose = data[data.length - 1].close;
  const scaleRatio = lastClose > 0 ? (basePrice / lastClose) : 1;

  for (let i = 0; i < count; i++) {
    const rawOpen = (i === 0) ? (data[i].open * scaleRatio) : data[i - 1].close;
    const rawClose = data[i].close * scaleRatio;
    const rawHigh = Math.max(rawOpen, rawClose, data[i].high * scaleRatio);
    const rawLow = Math.min(rawOpen, rawClose, Math.max(0.000001, data[i].low * scaleRatio));

    data[i].open = parseFloat(rawOpen.toFixed(precision));
    data[i].close = parseFloat(rawClose.toFixed(precision));
    data[i].high = parseFloat(Math.max(rawHigh, data[i].open, data[i].close).toFixed(precision));
    data[i].low = parseFloat(Math.min(rawLow, data[i].open, data[i].close).toFixed(precision));

    // Đảm bảo tuyệt đối: open của nến i phải bằng close của nến i - 1
    if (i > 0) {
      data[i].open = data[i - 1].close;
      data[i].high = Math.max(data[i].high, data[i].open, data[i].close);
      data[i].low = Math.min(data[i].low, data[i].open, data[i].close);
    }
  }

  return data;
};
