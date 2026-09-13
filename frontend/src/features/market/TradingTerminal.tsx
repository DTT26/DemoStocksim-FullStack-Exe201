import { useState } from 'react';
import { ChartArea } from './components/ChartArea';
import { RightSidebar } from './components/RightSidebar';
import { LeftToolbar } from './components/LeftToolbar';
import { ToolbarNavbar } from '../../components/ToolbarNavbar';
import { STOCKS, type Stock } from './data';

export interface TradeOrder {
  id: string;
  type: 'buy' | 'sell';
  symbol: string;
  price: number;
  qty: number;
  timestamp: number;
  tp?: number;
  sl?: number;
}

export const TradingTerminal = () => {
  const [activeTool, setActiveTool] = useState<string>('cursor');
  const [selectedStock, setSelectedStock] = useState<Stock>(STOCKS[0]);
  const [tradeOrders, setTradeOrders] = useState<TradeOrder[]>([]);
  const [activeTimeframe, setActiveTimeframe] = useState<string>('D');
  const [balance, setBalance] = useState<number>(100_000_000);
  const [positions, setPositions] = useState<Record<string, number>>({});

  // Bar Replay state
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayIndex, setReplayIndex] = useState(0);

  const handleToolClick = (toolName: string) => {
    setActiveTool(toolName === activeTool && toolName !== 'cursor' ? activeTool : toolName);
  };

  const handleStockSelect = (stock: Stock) => {
    setSelectedStock(stock);
    // Stop replay when switching stocks
    if (isReplaying) {
      setIsReplaying(false);
      setReplayIndex(0);
    }
  };

  const handleTrade = (type: 'buy' | 'sell', price: number, qty: number, tp?: number, sl?: number) => {
    const total = price * qty;
    if (type === 'buy') {
      if (total > balance) return { success: false, message: 'Số dư không đủ' };
      setBalance(b => b - total);
      setPositions(p => ({ ...p, [selectedStock.symbol]: (p[selectedStock.symbol] || 0) + qty }));
    } else {
      const held = positions[selectedStock.symbol] || 0;
      if (qty > held) return { success: false, message: `Không đủ cổ phiếu (đang có ${held})` };
      setBalance(b => b + total);
      setPositions(p => ({ ...p, [selectedStock.symbol]: p[selectedStock.symbol] - qty }));
    }
    // Record order → will draw price line on chart
    const order: TradeOrder = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      symbol: selectedStock.symbol,
      price,
      qty,
      timestamp: Date.now(),
      tp,
      sl,
    };
    setTradeOrders(prev => [...prev, order]);
    return { success: true, message: `✅ ${type === 'buy' ? 'Mua' : 'Bán'} ${qty} ${selectedStock.symbol} @ ${price.toLocaleString('vi-VN')}₫` };
  };

  const handleStartReplay = (fromIndex: number) => {
    setReplayIndex(fromIndex);
    setIsReplaying(true);
  };

  const handleReplayNext = () => {
    setReplayIndex(i => i + 1);
  };

  const handleStopReplay = () => {
    setIsReplaying(false);
    setReplayIndex(0);
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <ToolbarNavbar
        selectedStock={selectedStock}
        activeTimeframe={activeTimeframe}
        onTimeframeChange={setActiveTimeframe}
        balance={balance}
        isReplaying={isReplaying}
        replayIndex={replayIndex}
        onStartReplay={handleStartReplay}
        onReplayNext={handleReplayNext}
        onStopReplay={handleStopReplay}
      />
      {/* Simulation Header */}
      <div className="h-8 bg-[#1e222d] border-b border-[#2a2e39] flex items-center px-4 justify-between text-xs text-[#d1d4dc] shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-white">Vietnam Stock Challenge #01</span>
          <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-900/30 px-1.5 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> LIVE
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5">
            <span className="text-[#787b86]">Rank</span>
            <span className="font-bold text-blue-400">#7 / 42</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[#787b86]">Return</span>
            <span className="font-bold text-emerald-400">+8.52%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[#787b86]">Simulation Time</span>
            <span className="font-mono text-slate-300">2026-09-12 14:30</span>
          </div>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <LeftToolbar activeTool={activeTool} onToolClick={handleToolClick} />
        <ChartArea
          activeTool={activeTool}
          selectedStock={selectedStock}
          activeTimeframe={activeTimeframe}
          isReplaying={isReplaying}
          replayIndex={replayIndex}
          tradeOrders={tradeOrders.filter(o => o.symbol === selectedStock.symbol)}
        />
        <RightSidebar
          selectedStock={selectedStock}
          positions={positions}
          balance={balance}
          onStockSelect={handleStockSelect}
          onTrade={handleTrade}
        />
      </div>
    </div>
  );
};
