import { useState, useEffect } from 'react';
import { formatVolume } from '../data';
import { useMarketStore } from '../../../stores/useMarketStore';
import { useNavigate } from 'react-router-dom';

export const StockTable = () => {
  const navigate = useNavigate();
  const stocks = useMarketStore(state => state.stocks);
  const fetchMarketData = useMarketStore(state => state.fetchMarketData);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 3000);
    return () => clearInterval(interval);
  }, [fetchMarketData]);

  const filteredStocks = stocks.filter(s =>
    s.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="glass-panel overflow-hidden">
      <div className="p-5 border-b border-border flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-white">Market Watch</h2>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Dữ liệu Thực tế Trực tiếp (Binance & BingX)
          </span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search symbol..."
            className="bg-slate-800/50 border border-border rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/30 text-slate-400 text-sm">
              <th className="p-4 font-medium">Symbol</th>
              <th className="p-4 font-medium">Asset</th>
              <th className="p-4 font-medium">Sàn</th>
              <th className="p-4 font-medium text-right">Price (USD)</th>
              <th className="p-4 font-medium text-right">Change</th>
              <th className="p-4 font-medium text-right">% Change</th>
              <th className="p-4 font-medium text-right">Volume 24h</th>
              <th className="p-4 font-medium text-center">Giao dịch</th>
            </tr>
          </thead>
          <tbody>
            {filteredStocks.map((stock) => (
              <tr
                key={stock.symbol}
                className="stock-row hover:bg-slate-800/30 cursor-pointer transition-colors"
                onClick={() => navigate(`/trade/${stock.symbol.toLowerCase()}`)}
              >
                <td className="p-4">
                  <span className={`font-bold ${stock.type === 'up' ? 'text-up' : 'text-down'}`}>
                    {stock.symbol}
                  </span>
                </td>
                <td className="p-4 text-slate-300 text-sm">{stock.name}</td>
                <td className="p-4 text-slate-400 text-xs">{stock.exchange}</td>
                <td className={`p-4 text-right font-medium ${stock.type === 'up' ? 'text-up' : 'text-down'}`}>
                  ${stock.price >= 1 ? stock.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : stock.price.toFixed(4)}
                </td>
                <td className={`p-4 text-right ${stock.type === 'up' ? 'text-up' : 'text-down'}`}>
                  {stock.change > 0 ? '+' : ''}${Math.abs(stock.change) >= 1 ? stock.change.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : stock.change.toFixed(4)}
                </td>
                <td className={`p-4 text-right ${stock.type === 'up' ? 'text-up' : 'text-down'}`}>
                  {stock.change > 0 ? '+' : ''}{stock.percent.toFixed(2)}%
                </td>
                <td className="p-4 text-right text-slate-400">{formatVolume(stock.volume24h)}</td>
                <td className="p-4 flex justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => navigate(`/trade/${stock.symbol.toLowerCase()}`)}
                    className="bg-up/10 text-up hover:bg-up hover:text-white px-3 py-1 rounded-md text-xs font-semibold transition-colors"
                  >
                    TRADE
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
