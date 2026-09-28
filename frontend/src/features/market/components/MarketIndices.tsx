import { useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useMarketStore } from '../../../stores/useMarketStore';
import { formatVolume } from '../data';

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
  { name: 'S&P 500', symbol: 'SPX', value: 7682.20, change: -50.2, percent: -0.65, volume: '45B', color: 'down' },
  { name: 'NASDAQ 100', symbol: 'NDX', value: 30205.54, change: -403.5, percent: -1.32, volume: '38B', color: 'down' },
  { name: 'DOW JONES', symbol: 'DJI', value: 51474.30, change: -253.2, percent: -0.49, volume: '22B', color: 'down' },
  { name: 'GOLD SPOT', symbol: 'XAUUSD', value: 4124.46, change: -160.8, percent: -3.75, volume: '35B', color: 'down' },
];

export const MarketIndices = () => {
  const tickers = useMarketStore(state => state.tickers);
  const fetchMarketData = useMarketStore(state => state.fetchMarketData);

  useEffect(() => {
    fetchMarketData();
    const timer = setInterval(fetchMarketData, 3000);
    return () => clearInterval(timer);
  }, [fetchMarketData]);

  const indices: IndexItem[] = DEFAULT_INDICES.map(idx => {
    const t = tickers[idx.symbol];
    if (t && t.price > 0) {
      return {
        ...idx,
        value: t.price,
        change: t.change,
        percent: t.percent,
        volume: t.quoteVolume24h ? formatVolume(t.quoteVolume24h) : idx.volume,
        color: t.type,
      };
    }
    return idx;
  });

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
