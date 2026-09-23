import { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface OrderBookProps {
  symbol: string;
  currentPrice: number;
  isUp: boolean;
}

interface OrderRow {
  price: number;
  amount: number;
  total: number;
}

export const OrderBook = ({ symbol, currentPrice, isUp }: OrderBookProps) => {
  const [asks, setAsks] = useState<OrderRow[]>([]);
  const [bids, setBids] = useState<OrderRow[]>([]);
  const [buyRatio, setBuyRatio] = useState(92);

  const baseSymbol = symbol.replace('USDT', '').replace('.P', '');
  const quoteSymbol = symbol.includes('USDT') ? 'USDT' : 'VND';
  
  // Decide decimal places based on price
  const priceDecimals = currentPrice < 10 ? 4 : (currentPrice > 1000 ? 1 : 2);
  const amountDecimals = currentPrice > 1000 ? 4 : 2;

  // Generate initial book
  useEffect(() => {
    const generateSide = (startPrice: number, isAsk: boolean) => {
      let currentTotal = 0;
      const rows: OrderRow[] = [];
      const step = currentPrice * 0.0001; // 0.01% step
      
      for (let i = 0; i < 10; i++) {
        const p = isAsk ? startPrice + (step * (10 - i)) : startPrice - (step * (i + 1));
        const a = (Math.random() * (currentPrice > 1000 ? 0.5 : 500)) + (currentPrice > 1000 ? 0.01 : 10);
        rows.push({ price: p, amount: a, total: 0 });
      }
      
      // Calculate totals
      if (isAsk) {
        // Asks accumulate from bottom to top
        for (let i = 9; i >= 0; i--) {
          currentTotal += rows[i].amount;
          rows[i].total = currentTotal;
        }
      } else {
        // Bids accumulate from top to bottom
        for (let i = 0; i < 10; i++) {
          currentTotal += rows[i].amount;
          rows[i].total = currentTotal;
        }
      }
      
      return rows;
    };

    setAsks(generateSide(currentPrice, true));
    setBids(generateSide(currentPrice, false));
  }, [symbol]); // Only re-generate completely when symbol changes

  // Realtime simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Fluctuate amounts slightly
      const fluctuate = (rows: OrderRow[], isAsk: boolean) => {
        let currentTotal = 0;
        const newRows = rows.map(r => ({
          ...r,
          amount: Math.max((currentPrice > 1000 ? 0.001 : 0.1), r.amount + (Math.random() - 0.5) * (currentPrice > 1000 ? 0.05 : 10))
        }));
        
        if (isAsk) {
          for (let i = 9; i >= 0; i--) {
            currentTotal += newRows[i].amount;
            newRows[i].total = currentTotal;
          }
        } else {
          for (let i = 0; i < 10; i++) {
            currentTotal += newRows[i].amount;
            newRows[i].total = currentTotal;
          }
        }
        return newRows;
      };

      setAsks(prev => fluctuate(prev, true));
      setBids(prev => fluctuate(prev, false));
      setBuyRatio(prev => Math.min(99, Math.max(1, prev + (Math.random() - 0.5) * 5)));
    }, 1500); // 1.5s refresh rate
    return () => clearInterval(interval);
  }, [currentPrice]);

  const maxTotal = Math.max(
    asks.length > 0 ? asks[0].total : 0, 
    bids.length > 0 ? bids[bids.length - 1].total : 0
  );

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-white dark:bg-[#131722]">
      <div className="flex flex-col flex-1 p-2 min-h-0">
          {/* Orderbook Header */}
          <div className="flex items-center justify-between text-[10px] text-[#787b86] mb-2 px-1">
            <span className="w-[30%]">Giá({quoteSymbol})</span>
            <span className="w-[35%] text-right">Số lượng({baseSymbol})</span>
            <span className="w-[35%] text-right">Tổng({baseSymbol})</span>
          </div>

          <div className="flex flex-col flex-1 min-h-0 relative">
            {/* Asks (Red) */}
            <div className="flex flex-col flex-1 justify-end overflow-hidden">
              {asks.map((ask, i) => {
                const width = maxTotal > 0 ? (ask.total / maxTotal) * 100 : 0;
                return (
                  <div key={i} className="flex items-center justify-between text-[11px] font-mono relative h-[18px] cursor-pointer hover:bg-[#2a2e39]/30">
                    <div 
                      className="absolute right-0 top-0 bottom-0 bg-[#f23645]/10 dark:bg-[#f23645]/20 z-0 transition-all duration-300"
                      style={{ width: `${width}%` }}
                    />
                    <span className="w-[30%] text-[#f23645] z-10 pl-1">{ask.price.toFixed(priceDecimals)}</span>
                    <span className="w-[35%] text-right text-[#1e2329] dark:text-[#d1d4dc] z-10">{ask.amount.toFixed(amountDecimals)}</span>
                    <span className="w-[35%] text-right text-[#1e2329] dark:text-[#d1d4dc] z-10 pr-1">{ask.total.toFixed(amountDecimals)}</span>
                  </div>
                );
              })}
            </div>

            {/* Middle Price */}
            <div className="flex items-center gap-2 py-2 my-1 border-y border-[#e6e8ea] dark:border-[#2a2e39]/30 shrink-0">
              <span className={`text-lg font-bold font-mono flex items-center ${isUp ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                {currentPrice.toLocaleString('vi-VN', { minimumFractionDigits: priceDecimals, maximumFractionDigits: priceDecimals })}
                {isUp ? <ArrowUp className="w-4 h-4 ml-1" /> : <ArrowDown className="w-4 h-4 ml-1" />}
              </span>
              <span className="text-xs text-[#787b86] font-mono underline decoration-dashed underline-offset-2">
                {(currentPrice * 0.9998).toLocaleString('vi-VN', { minimumFractionDigits: priceDecimals, maximumFractionDigits: priceDecimals })}
              </span>
            </div>

            {/* Bids (Green) */}
            <div className="flex flex-col flex-1 overflow-hidden">
              {bids.map((bid, i) => {
                const width = maxTotal > 0 ? (bid.total / maxTotal) * 100 : 0;
                return (
                  <div key={i} className="flex items-center justify-between text-[11px] font-mono relative h-[18px] cursor-pointer hover:bg-[#2a2e39]/30">
                    <div 
                      className="absolute right-0 top-0 bottom-0 bg-[#089981]/10 dark:bg-[#089981]/20 z-0 transition-all duration-300"
                      style={{ width: `${width}%` }}
                    />
                    <span className="w-[30%] text-[#089981] z-10 pl-1">{bid.price.toFixed(priceDecimals)}</span>
                    <span className="w-[35%] text-right text-[#1e2329] dark:text-[#d1d4dc] z-10">{bid.amount.toFixed(amountDecimals)}</span>
                    <span className="w-[35%] text-right text-[#1e2329] dark:text-[#d1d4dc] z-10 pr-1">{bid.total.toFixed(amountDecimals)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Buy/Sell Ratio */}
          <div className="flex items-center h-5 mt-2 rounded overflow-hidden text-[9px] font-bold shrink-0 shadow-sm">
            <div 
              className="bg-[#089981]/20 text-[#089981] flex items-center pl-2 h-full transition-all duration-500"
              style={{ width: `${buyRatio}%` }}
            >
              B | {buyRatio.toFixed(0)}%
            </div>
            <div 
              className="bg-[#f23645]/20 text-[#f23645] flex items-center justify-end pr-2 h-full transition-all duration-500"
              style={{ width: `${100 - buyRatio}%` }}
            >
              {(100 - buyRatio).toFixed(0)}% | S
            </div>
          </div>
        </div>
    </div>
  );
};
