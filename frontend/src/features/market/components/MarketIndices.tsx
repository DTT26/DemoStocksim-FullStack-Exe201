import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { fetchAllMarketLivePrices } from '../../../services/marketDataService';
import { STOCKS } from '../data';

interface IndexItem {
  name: string;
  symbol: string;
  value: number;
  change: number;
  percent: number;
  volume: string;
  color: 'up' | 'down';
}

const DEFAULT_INDICES: IndexItem[] = [
  { name: 'S&P 500', symbol: 'SPX', value: 7711.70, change: 35.4, percent: 0.46, volume: '45B', color: 'up' },
  { name: 'NASDAQ 100', symbol: 'NDX', value: 30355.49, change: 180.5, percent: 0.60, volume: '38B', color: 'up' },
  { name: 'DOW JONES', symbol: 'DJI', value: 51632.40, change: 120.2, percent: 0.23, volume: '22B', color: 'up' },
  { name: 'GOLD SPOT', symbol: 'XAUUSD', value: 4182.00, change: -93.4, percent: -2.18, volume: '35B', color: 'down' },
];

export const MarketIndices = () => {
  const [indices, setIndices] = useState<IndexItem[]>(DEFAULT_INDICES);

  useEffect(() => {
    let isMounted = true;
    const fetchLive = async () => {
      try {
        const livePrices = await fetchAllMarketLivePrices();
        if (!isMounted) return;

        setIndices(prev =>
          prev.map(idx => {
            const livePrice = livePrices[idx.symbol];
            if (!livePrice || livePrice === idx.value) return idx;
            const stockBase = STOCKS.find(s => s.symbol === idx.symbol);
            const basePrice = stockBase ? stockBase.price : idx.value;
            const change = livePrice - basePrice;
            const percent = (change / basePrice) * 100;
            return {
              ...idx,
              value: livePrice,
              change: parseFloat(change.toFixed(2)),
              percent: parseFloat(percent.toFixed(2)),
              color: change >= 0 ? 'up' : 'down',
            };
          })
        );
      } catch (err) {
        // bỏ qua
      }
    };

    fetchLive();
    const timer = setInterval(fetchLive, 3000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {indices.map((index) => (
        <div key={index.name} className="glass-panel p-5 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors duration-500"></div>
          
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="text-slate-400 font-medium">{index.name}</h3>
            {index.color === 'up' ? (
              <TrendingUp className="text-up w-5 h-5" />
            ) : (
              <TrendingDown className="text-down w-5 h-5" />
            )}
          </div>
          
          <div className="relative z-10">
            <div className="text-2xl font-bold text-white mb-1">
              ${index.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className={`font-medium ${index.color === 'up' ? 'text-up' : 'text-down'}`}>
                {index.change > 0 ? '+' : ''}{index.change} ({index.percent}%)
              </span>
              <span className="text-slate-500">Vol: {index.volume}</span>
            </div>
          </div>
          
          {/* Faux Sparkline */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-800">
             <div 
               className={`h-full ${index.color === 'up' ? 'bg-up' : 'bg-down'} opacity-50`} 
               style={{ width: `${Math.random() * 40 + 30}%` }}
             ></div>
          </div>
        </div>
      ))}
    </div>
  );
};
