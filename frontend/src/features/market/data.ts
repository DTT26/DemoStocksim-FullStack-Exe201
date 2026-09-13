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

export const generateOHLCV = (basePrice: number, count = 300) => {
  const data = [];
  
  // Dùng basePrice làm Seed để mỗi cổ phiếu luôn ra 1 biểu đồ cố định
  let seed = basePrice * 1000;
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  // Cố định thời điểm kết thúc (Tránh trục thời gian bị trôi)
  let endTime = 1784030400000; // Tương đương đâu đó năm 2026
  
  // Đi ngược từ giá hiện tại về quá khứ để đảm bảo nến cuối cùng luôn khớp chuẩn giá thị trường
  let close = basePrice;

  for (let i = 0; i < count; i++) {
    // Random biến động (giả lập)
    const open = close - (random() - 0.5) * basePrice * 0.015;
    const high = Math.max(open, close) + random() * basePrice * 0.008;
    const low  = Math.min(open, close) - random() * basePrice * 0.008;
    
    // Thêm vào đầu mảng (vì đang đi lùi thời gian)
    data.unshift({
      timestamp: endTime,
      open:   parseFloat(open.toFixed(2)),
      high:   parseFloat(high.toFixed(2)),
      low:    parseFloat(low.toFixed(2)),
      close:  parseFloat(close.toFixed(2)),
      volume: random() * 500000 + 50000,
    });
    
    close = open - (random() - 0.5) * basePrice * 0.012; // Giá đóng cửa của nến trước đó
    endTime -= 86400 * 1000; // Đi lùi 1 ngày
  }
  
  return data;
};
