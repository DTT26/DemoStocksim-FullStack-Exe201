import React from 'react';
import { mockIndices } from '../mockData';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const MarketIndices = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {mockIndices.map((index) => (
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
              {index.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
