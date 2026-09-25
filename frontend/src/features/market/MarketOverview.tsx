import React from 'react';
import { MarketIndices } from './components/MarketIndices';
import { StockTable } from './components/StockTable';

export const MarketOverview = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Market Overview</h1>
          <p className="text-slate-400">Real-time mock data for StockSim platform.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors border border-border">
            Filter
          </button>
          <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium shadow-lg shadow-primary/20 transition-all">
            Dashboard
          </button>
        </div>
      </div>

      <MarketIndices />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StockTable />
        </div>
        <div className="space-y-6">
          {/* Placeholder for top gainers/losers or mini chart */}
          <div className="glass-panel p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Top Gainers</h3>
            <div className="space-y-3">
              {[
                { s: 'DOGEUSDT', c: '+15.3%' },
                { s: 'BTCUSDT', c: '+1.90%' },
                { s: 'NVDA', c: '+1.76%' }
              ].map(t => (
                <div key={t.s} className="flex justify-between items-center p-2 rounded hover:bg-slate-800/50 transition-colors cursor-pointer">
                  <span className="font-medium text-slate-200">{t.s}</span>
                  <span className="text-up font-medium">{t.c}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="glass-panel p-5 relative overflow-hidden flex flex-col items-center justify-center min-h-[200px] text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
            <div className="relative z-10 space-y-3">
              <h3 className="text-xl font-bold text-white">Join Simulation</h3>
              <p className="text-sm text-slate-400">Compete with your peers in real-time market conditions.</p>
              <button className="mt-2 px-6 py-2 bg-white text-slate-900 rounded-full font-bold hover:bg-slate-200 transition-colors shadow-lg">
                View Active Rooms
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
