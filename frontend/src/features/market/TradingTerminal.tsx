import { useState } from 'react';
import { ChartArea } from './components/ChartArea';
import { RightSidebar } from './components/RightSidebar';
import { LeftToolbar } from './components/LeftToolbar';
import { ToolbarNavbar } from '../../components/ToolbarNavbar';
import { STOCKS, type Stock } from './data';
import { SymbolSearchModal } from './components/SymbolSearchModal';
import { IndicatorModal } from './components/IndicatorModal';
import { TickerHeader } from './components/TickerHeader';

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

import { CoinInfoPanel } from './components/CoinInfoPanel';
import { ContractInfoPanel } from './components/ContractInfoPanel';

export const TradingTerminal = () => {
  const [activeTab, setActiveTab] = useState<'chart' | 'coin_info' | 'info'>('chart');
  const [activeTool, setActiveTool] = useState<string>('cursor');
  const [selectedStock, setSelectedStock] = useState<Stock>(STOCKS[0]);
  const [tradeOrders, setTradeOrders] = useState<TradeOrder[]>([]);
  const [activeTimeframe, setActiveTimeframe] = useState<string>('D');
  const [balance, setBalance] = useState<number>(100_000_000);
  const [positions, setPositions] = useState<Record<string, number>>({});
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isIndicatorModalOpen, setIsIndicatorModalOpen] = useState(false);
  const [activeIndicators, setActiveIndicators] = useState<string[]>([]);

  const handleToggleIndicator = (name: string) => {
    setActiveIndicators(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

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
    <div className="flex flex-col flex-1 overflow-hidden bg-white dark:bg-[#131722] text-[#1e2329] dark:text-[#d1d4dc]">
      <ToolbarNavbar balance={balance} />

      <div className="flex flex-1 overflow-hidden">
        <LeftToolbar activeTool={activeTool} onToolSelect={handleToolClick} />
        
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          <TickerHeader 
            stock={selectedStock}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            activeTimeframe={activeTimeframe}
            onTimeframeChange={setActiveTimeframe}
            isReplaying={isReplaying}
            replayIndex={replayIndex}
            onStartReplay={handleStartReplay}
            onReplayNext={handleReplayNext}
            onStopReplay={handleStopReplay}
            onOpenSearch={() => setIsSearchModalOpen(true)}
            onOpenIndicator={() => setIsIndicatorModalOpen(true)}
            activeIndicatorCount={activeIndicators.length}
          />
          {activeTab === 'chart' && (
            <ChartArea
              activeTool={activeTool}
              selectedStock={selectedStock}
              activeTimeframe={activeTimeframe}
              isReplaying={isReplaying}
              replayIndex={replayIndex}
              tradeOrders={tradeOrders.filter(o => o.symbol === selectedStock.symbol)}
              activeIndicators={activeIndicators}
              onPriceUpdate={(price) => {
                setSelectedStock(prev => {
                  if (prev.price === price) return prev;
                  // Tính toán % dựa trên giá tham chiếu ban đầu (mock)
                  const basePrice = STOCKS.find(s => s.symbol === prev.symbol)?.price || prev.price;
                  const change = price - basePrice;
                  const percent = (change / basePrice) * 100;
                  return { ...prev, price, change, percent, type: change >= 0 ? 'up' : 'down' };
                });
              }}
            />
          )}
          {activeTab === 'coin_info' && (
            <CoinInfoPanel stock={selectedStock} />
          )}
          {activeTab === 'info' && (
            <ContractInfoPanel stock={selectedStock} />
          )}
        </div>

        <RightSidebar
          selectedStock={selectedStock}
          positions={positions}
          balance={balance}
          onStockSelect={handleStockSelect}
          onTrade={handleTrade}
        />
      </div>

      <SymbolSearchModal 
        isOpen={isSearchModalOpen} 
        onClose={() => setIsSearchModalOpen(false)} 
        onSelect={handleStockSelect} 
      />
      <IndicatorModal
        isOpen={isIndicatorModalOpen}
        onClose={() => setIsIndicatorModalOpen(false)}
        activeIndicators={activeIndicators}
        onToggle={handleToggleIndicator}
      />
    </div>
  );
};
