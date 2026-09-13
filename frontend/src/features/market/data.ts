export const STOCKS = [
  { symbol: 'FPT',  name: 'FPT Corp',         price: 115.50, change: +2.48,  percent: +2.21, type: 'up'   as const },
  { symbol: 'VCB',  name: 'Vietcombank',       price:  92.00, change: -0.47,  percent: -0.51, type: 'down' as const },
  { symbol: 'HPG',  name: 'Hoa Phat Group',    price:  30.50, change: +1.20,  percent: +4.09, type: 'up'   as const },
  { symbol: 'SSI',  name: 'SSI Securities',    price:  38.20, change: +0.80,  percent: +2.14, type: 'up'   as const },
  { symbol: 'VIC',  name: 'Vingroup',          price:  45.00, change: -0.98,  percent: -2.13, type: 'down' as const },
  { symbol: 'VNM',  name: 'Vinamilk',          price:  68.40, change: +0.10,  percent: +0.15, type: 'up'   as const },
  { symbol: 'MWG',  name: 'Mobile World',      price:  52.30, change: -1.20,  percent: -2.24, type: 'down' as const },
  { symbol: 'TCB',  name: 'Techcombank',       price:  42.10, change: +1.50,  percent: +3.69, type: 'up'   as const },
  { symbol: 'BID',  name: 'BIDV',              price:  45.80, change: +0.55,  percent: +1.21, type: 'up'   as const },
  { symbol: 'CTG',  name: 'VietinBank',        price:  32.90, change: -0.30,  percent: -0.90, type: 'down' as const },
  { symbol: 'VHM',  name: 'Vinhomes',          price:  38.75, change: +0.85,  percent: +2.24, type: 'up'   as const },
  { symbol: 'SAB',  name: 'Sabeco',            price: 148.00, change: -1.50,  percent: -1.00, type: 'down' as const },
];

export type Stock = typeof STOCKS[0];

export const TIMEFRAMES = ['1m', '5m', '15m', '30m', '1h', '4h', 'D', 'W', 'M'];

export const generateOHLCV = (basePrice: number, count = 200) => {
  const data = [];
  let time = Date.now() - 86400 * 1000 * count;
  let close = basePrice;
  for (let i = 0; i < count; i++) {
    const open = close + (Math.random() - 0.5) * basePrice * 0.015;
    const high = Math.max(open, close) + Math.random() * basePrice * 0.008;
    const low  = Math.min(open, close) - Math.random() * basePrice * 0.008;
    close = open + (Math.random() - 0.5) * basePrice * 0.012;
    data.push({
      timestamp: time,
      open:   parseFloat(open.toFixed(2)),
      high:   parseFloat(high.toFixed(2)),
      low:    parseFloat(low.toFixed(2)),
      close:  parseFloat(close.toFixed(2)),
      volume: Math.random() * 500000 + 50000,
    });
    time += 86400 * 1000;
  }
  return data;
};
