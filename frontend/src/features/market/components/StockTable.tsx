import React from 'react';
import { mockStocks } from '../mockData';

export const StockTable = () => {
  return (
    <div className="glass-panel overflow-hidden">
      <div className="p-5 border-b border-border flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">Market Watch</h2>
        <div className="flex gap-2">
          <input 
            type="text" 
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
              <th className="p-4 font-medium">Company</th>
              <th className="p-4 font-medium text-right">Price</th>
              <th className="p-4 font-medium text-right">Change</th>
              <th className="p-4 font-medium text-right">% Change</th>
              <th className="p-4 font-medium text-right">Volume</th>
              <th className="p-4 font-medium text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {mockStocks.map((stock) => (
              <tr key={stock.symbol} className="stock-row">
                <td className="p-4">
                  <span className={`font-bold ${stock.type === 'up' ? 'text-up' : 'text-down'}`}>
                    {stock.symbol}
                  </span>
                </td>
                <td className="p-4 text-slate-300 text-sm">{stock.company}</td>
                <td className={`p-4 text-right font-medium ${stock.type === 'up' ? 'text-up' : 'text-down'}`}>
                  {stock.price.toFixed(2)}
                </td>
                <td className={`p-4 text-right ${stock.type === 'up' ? 'text-up' : 'text-down'}`}>
                  {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}
                </td>
                <td className={`p-4 text-right ${stock.type === 'up' ? 'text-up' : 'text-down'}`}>
                  {stock.change > 0 ? '+' : ''}{stock.percent.toFixed(2)}%
                </td>
                <td className="p-4 text-right text-slate-400">{stock.volume}</td>
                <td className="p-4 flex justify-center gap-2">
                  <button className="bg-up/10 text-up hover:bg-up hover:text-white px-3 py-1 rounded-md text-xs font-semibold transition-colors">
                    BUY
                  </button>
                  <button className="bg-down/10 text-down hover:bg-down hover:text-white px-3 py-1 rounded-md text-xs font-semibold transition-colors">
                    SELL
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
