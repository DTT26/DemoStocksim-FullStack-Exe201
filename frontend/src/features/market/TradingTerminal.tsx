import { useState, useEffect } from 'react';
import { ChartArea } from './components/ChartArea';
import { RightSidebar } from './components/RightSidebar';
import { RightToolbar } from './components/RightToolbar';
import { WatchlistPanel, type Watchlist } from './components/WatchlistPanel';
import { SimulationPanel } from './components/SimulationPanel';
import { CalculatorPanel } from './components/CalculatorPanel';
import { LeftToolbar } from './components/LeftToolbar';
import { ToolbarNavbar } from '../../components/ToolbarNavbar';
import { ChartSettingsModal } from './components/ChartSettingsModal';
import { getWatchlists, createWatchlist as apiCreateWatchlist, updateWatchlist as apiUpdateWatchlist, deleteWatchlist as apiDeleteWatchlist } from '../../services/marketApi';
import { useAuth } from '../../contexts/AuthContext';
import { STOCKS, type Stock } from './data';
import { DEFAULT_CHART_SETTINGS, type ChartSettings } from './chartSettings';
import { SymbolSearchModal } from './components/SymbolSearchModal';
import { IndicatorModal } from './components/IndicatorModal';
import { TickerHeader } from './components/TickerHeader';
import { CoinInfoPanel } from './components/CoinInfoPanel';
import { ContractInfoPanel } from './components/ContractInfoPanel';
import { BottomPanel } from './components/BottomPanel';
import { tradingApi } from '../../services/tradingApi';

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
  const [activeTab, setActiveTab] = useState<'chart' | 'coin_info' | 'info'>('chart');
  const [activeTool, setActiveTool] = useState<string>('cursor');
  const [selectedStock, setSelectedStock] = useState<Stock>(STOCKS[0]);
  const [tradeOrders, setTradeOrders] = useState<TradeOrder[]>([]);
  const [activeTimeframe, setActiveTimeframe] = useState<string>('D');
  const [balance, setBalance] = useState<number>(100_000_000);
  const [positions, setPositions] = useState<Record<string, { quantity: number, averagePrice: number, side: 'LONG'|'SHORT', leverage: number, tp?: number, sl?: number }>>({});
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isIndicatorModalOpen, setIsIndicatorModalOpen] = useState(false);
  const [activeIndicators, setActiveIndicators] = useState<string[]>([]);
  const [tradeCount, setTradeCount] = useState(0);
  
  const [activeRightPanel, setActiveRightPanel] = useState<'watchlist' | 'order' | 'simulation' | 'calculator' | null>('watchlist');
  
  const { user } = useAuth();
  
  const [watchlists, setWatchlists] = useState<Watchlist[]>(() => {
    try {
      const saved = localStorage.getItem('watchlists');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [{ id: '1', name: 'Danh sách của tôi', symbols: ['BTCUSDT', 'ETHUSDT', 'FPT', 'VNINDEX'] }];
  });

  // Fetch watchlists from API if user is logged in
  useEffect(() => {
    const fetchAPI = async () => {
      const token = localStorage.getItem('token');
      if (user && token) {
        try {
          const data = await getWatchlists(token);
          if (data && data.length > 0) {
            // map _id to id if needed
            const mapped = data.map((w: any) => ({ ...w, id: w._id || w.id }));
            setWatchlists(mapped);
          }
        } catch (error) {
          console.error("Failed to fetch watchlists", error);
        }
      }
    };
    fetchAPI();
  }, [user]);

  useEffect(() => {
    // Only save to local storage if NOT logged in, otherwise let API handle it.
    // Actually, saving to localStorage as a fallback is fine.
    if (!user) {
      localStorage.setItem('watchlists', JSON.stringify(watchlists));
    }
  }, [watchlists, user]);

  const [activeWatchlistId, setActiveWatchlistId] = useState<string>(watchlists[0]?.id || '1');

  const handleUpdateWatchlist = async (id: string, symbols: string[]) => {
    setWatchlists(prev => prev.map(w => w.id === id ? { ...w, symbols } : w));
    
    const token = localStorage.getItem('token');
    if (user && token) {
      try {
        await apiUpdateWatchlist(token, id, { symbols });
      } catch (error) {
        console.error("Failed to update watchlist on server", error);
      }
    }
  };
  
  const handleCreateWatchlist = async (name: string) => {
    const tempId = Date.now().toString();
    const newWatchlist = { id: tempId, name, symbols: [] };
    setWatchlists(prev => [...prev, newWatchlist]);
    setActiveWatchlistId(tempId);
    
    const token = localStorage.getItem('token');
    if (user && token) {
      try {
        const created = await apiCreateWatchlist(token, { name, symbols: [] });
        // Replace tempId with actual DB id
        const realId = (created as any)._id || created.id;
        setWatchlists(prev => prev.map(w => w.id === tempId ? { ...w, id: realId } : w));
        setActiveWatchlistId(realId);
      } catch (error) {
        console.error("Failed to create watchlist on server", error);
      }
    }
  };
  
  const handleDeleteWatchlist = async (id: string) => {
    setWatchlists(prev => prev.filter(w => w.id !== id));
    if (activeWatchlistId === id) {
      setActiveWatchlistId(watchlists.find(w => w.id !== id)?.id || watchlists[0]?.id || '');
    }
    
    const token = localStorage.getItem('token');
    if (user && token) {
      try {
        await apiDeleteWatchlist(token, id);
      } catch (error) {
        console.error("Failed to delete watchlist on server", error);
      }
    }
  };
  
  const handleRenameWatchlist = async (id: string, newName: string) => {
    setWatchlists(prev => prev.map(w => w.id === id ? { ...w, name: newName } : w));
    
    const token = localStorage.getItem('token');
    if (user && token) {
      try {
        await apiUpdateWatchlist(token, id, { name: newName });
      } catch (error) {
        console.error("Failed to rename watchlist on server", error);
      }
    }
  };

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [chartSettings, setChartSettings] = useState<ChartSettings>(() => {
    try {
      const saved = localStorage.getItem('chartSettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_CHART_SETTINGS,
          ...parsed,
          symbol: { ...DEFAULT_CHART_SETTINGS.symbol, ...(parsed.symbol || {}) },
          status: { ...DEFAULT_CHART_SETTINGS.status, ...(parsed.status || {}) },
          scales: { ...DEFAULT_CHART_SETTINGS.scales, ...(parsed.scales || {}) },
          canvas: { ...DEFAULT_CHART_SETTINGS.canvas, ...(parsed.canvas || {}) },
          alerts: { ...DEFAULT_CHART_SETTINGS.alerts, ...(parsed.alerts || {}) },
          events: { ...DEFAULT_CHART_SETTINGS.events, ...(parsed.events || {}) },
          candle: { ...DEFAULT_CHART_SETTINGS.candle, ...(parsed.candle || {}) },
        };
      }
      return DEFAULT_CHART_SETTINGS;
    } catch {
      return DEFAULT_CHART_SETTINGS;
    }
  });

  useEffect(() => {
    localStorage.setItem('chartSettings', JSON.stringify(chartSettings));
  }, [chartSettings]);

  const handleToggleIndicator = (name: string) => {
    setActiveIndicators(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  // Bar Replay state
  const [isReplaying, setIsReplaying] = useState(false);
  const [isSelectingReplayStart, setIsSelectingReplayStart] = useState(false);
  const [replayIndex, setReplayIndex] = useState(0);
  const [totalBars, setTotalBars] = useState(1000);
  const [goToRealtimeTrigger, setGoToRealtimeTrigger] = useState(0);

  const handleToolClick = (toolName: string) => {
    setActiveTool(toolName === activeTool && toolName !== 'cursor' ? activeTool : toolName);
  };

  const handleStockSelect = (stock: Stock) => {
    setSelectedStock(stock);
    if (isReplaying || isSelectingReplayStart) {
      setIsReplaying(false);
      setIsSelectingReplayStart(false);
      setReplayIndex(0);
    }
  };

  const fetchPortfolio = async () => {
    try {
      const res = await tradingApi.getPortfolio();
      if (res.success && res.data) {
        if (res.data.wallet) {
           setBalance(res.data.wallet.availableBalance);
        }
        if (res.data.holdings) {
           const newPositions: Record<string, { quantity: number, averagePrice: number, side: 'LONG'|'SHORT', leverage: number, tp?: number, sl?: number }> = {};
           res.data.holdings.forEach((h: any) => {
             newPositions[h.symbol] = { quantity: h.quantity, averagePrice: h.averagePrice, side: h.side, leverage: h.leverage, tp: h.tp, sl: h.sl };
           });
           setPositions(newPositions);
        }
      }
    } catch (e) {
      console.error('Failed to fetch portfolio', e);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handleTrade = async (type: 'buy' | 'sell' | 'close', price: number, margin: number, leverage: number, tp?: number, sl?: number) => {
    try {
      if (type === 'close') {
         const pos = positions[selectedStock.symbol];
         if (!pos) return { success: false, message: 'Không có vị thế để đóng' };
         
         const res = await tradingApi.closePosition(selectedStock.symbol, pos.side, price);
         if (res.success) {
            await fetchPortfolio();
            setTradeCount(c => c + 1);
            return { success: true, message: `✅ Đã chốt vị thế ${pos.side} thành công` };
         }
      } else if (type === 'buy') {
        const res = await tradingApi.buyStock(selectedStock.symbol, margin, leverage, price, sl, tp);
        if (res.success) {
           await fetchPortfolio();
           const order: TradeOrder = {
             id: `${Date.now()}-${Math.random()}`,
             type, symbol: selectedStock.symbol, price, qty: (margin*leverage)/price, timestamp: Date.now(), tp, sl,
           };
           setTradeOrders(prev => [...prev, order]);
           setTradeCount(c => c + 1);
           return { success: true, message: `✅ Mở LONG ${selectedStock.symbol} thành công` };
        }
      } else if (type === 'sell') {
        const res = await tradingApi.sellStock(selectedStock.symbol, margin, leverage, price);
        if (res.success) {
           await fetchPortfolio();
           const order: TradeOrder = {
             id: `${Date.now()}-${Math.random()}`,
             type, symbol: selectedStock.symbol, price, qty: (margin*leverage)/price, timestamp: Date.now(), tp, sl,
           };
           setTradeOrders(prev => [...prev, order]);
           setTradeCount(c => c + 1);
           return { success: true, message: `✅ Mở SHORT ${selectedStock.symbol} thành công` };
        }
      }
    } catch (error: any) {
       return { success: false, message: error.message || 'Giao dịch thất bại' };
    }
    return { success: false, message: 'Lỗi không xác định' };
  };

  const handleUpdateTPSL = async (tp?: number, sl?: number) => {
    try {
      const pos = positions[selectedStock.symbol];
      if (!pos) return { success: false, message: 'Không có vị thế' };
      
      const res = await tradingApi.updateTPSL(selectedStock.symbol, pos.side, tp, sl);
      if (res.success) {
         await fetchPortfolio();
         return { success: true, message: `✅ Đã cập nhật TP/SL` };
      }
      return { success: false, message: 'Lỗi cập nhật' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Lỗi hệ thống' };
    }
  };

  const handleCloseSpecificPosition = async (symbolToClose: string) => {
    try {
      const pos = positions[symbolToClose];
      if (!pos) return { success: false, message: 'Không có vị thế' };
      
      const currentPrice = symbolToClose === selectedStock.symbol ? selectedStock.price : (STOCKS.find(s => s.symbol === symbolToClose)?.price || pos.averagePrice);
      
      const res = await tradingApi.closePosition(symbolToClose, pos.side, currentPrice);
      if (res.success) {
        await fetchPortfolio();
        setTradeCount(c => c + 1);
        return { success: true, message: `✅ Đã chốt vị thế ${symbolToClose} thành công` };
      }
      return { success: false, message: res.message || 'Lỗi đóng lệnh' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Lỗi hệ thống' };
    }
  };

  const handleAddMargin = async (amount: number) => {
    try {
      const pos = positions[selectedStock.symbol];
      if (!pos) return { success: false, message: 'Không có vị thế' };
      
      const res = await tradingApi.addMargin(selectedStock.symbol, pos.side, amount);
      if (res.success) {
         await fetchPortfolio();
         return { success: true, message: res.message || `✅ Đã bơm thêm ký quỹ` };
      }
      return { success: false, message: res.message || 'Lỗi bơm ký quỹ' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Lỗi hệ thống' };
    }
  };

  // Auto Close on TP / SL / LIQUIDATION
  useEffect(() => {
    const pos = positions[selectedStock.symbol];
    if (!pos) return;

    const currentPrice = selectedStock.price;
    const actualMargin = (pos.averagePrice * pos.quantity) / pos.leverage;
    let pnl = 0;
    let shouldClose = false;
    let reason = '';

    if (pos.side === 'LONG') {
      pnl = (currentPrice - pos.averagePrice) * pos.quantity;
      if (pos.sl && currentPrice <= pos.sl) { shouldClose = true; reason = 'Chạm Cắt Lỗ (SL)'; }
      if (pos.tp && currentPrice >= pos.tp) { shouldClose = true; reason = 'Chạm Chốt Lời (TP)'; }
    } else if (pos.side === 'SHORT') {
      pnl = (pos.averagePrice - currentPrice) * pos.quantity;
      if (pos.sl && currentPrice >= pos.sl) { shouldClose = true; reason = 'Chạm Cắt Lỗ (SL)'; }
      if (pos.tp && currentPrice <= pos.tp) { shouldClose = true; reason = 'Chạm Chốt Lời (TP)'; }
    }

    // Liquidation Check
    if (pnl <= -actualMargin) {
      shouldClose = true;
      reason = 'Thanh lý (Cháy tài khoản)';
    }

    if (shouldClose) {
      const key = `${selectedStock.symbol}_${pos.side}`;
      if ((window as any)[`isClosing_${key}`]) return;
      (window as any)[`isClosing_${key}`] = true;

      handleTrade('close', currentPrice, 0, 0).then(res => {
         (window as any)[`isClosing_${key}`] = false;
         if (res.success) {
           alert(`⚠️ HỆ THỐNG TỰ ĐỘNG ĐÓNG VỊ THẾ!\nLý do: ${reason}\nGiá thực thi: ${currentPrice.toLocaleString('vi-VN')}₫`);
         }
      }).catch(() => {
         (window as any)[`isClosing_${key}`] = false;
      });
    }
  }, [selectedStock.price, positions, selectedStock.symbol]);

  const handleStartReplaySelection = () => {
    setIsSelectingReplayStart(true);
    setIsReplaying(false);
  };

  const handleCancelReplaySelection = () => {
    setIsSelectingReplayStart(false);
  };

  const handleConfirmReplayStart = (fromIndex: number) => {
    setReplayIndex(fromIndex);
    setIsSelectingReplayStart(false);
    setIsReplaying(true);
  };

  const handleGoToRealtime = () => {
    if (isReplaying || isSelectingReplayStart) {
      setIsReplaying(false);
      setIsSelectingReplayStart(false);
      setReplayIndex(0);
    }
    setGoToRealtimeTrigger(t => t + 1);
  };

  const handleReplayNext = () => {
    setReplayIndex(i => i + 1);
  };

  const handleStartSimulation = (config: SimulationConfig) => {
    console.log("Start simulation with config:", config);
    // Ideally we enter replay mode and reset states with the config
    setIsSelectingReplayStart(true);
    setIsReplaying(false);
  };

  const handleStopReplay = () => {
    setIsReplaying(false);
    setReplayIndex(0);
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-white dark:bg-[#131722] text-[#1e2329] dark:text-[#d1d4dc]">
      <ToolbarNavbar balance={balance} onOpenSettings={() => setIsSettingsModalOpen(true)} />

      <div className="flex flex-1 overflow-hidden">
        <LeftToolbar activeTool={activeTool} onToolSelect={handleToolClick} />
        
        <div className="flex flex-col flex-1 overflow-y-auto custom-scrollbar min-w-0 border-r border-[#2a2e39]">
          <TickerHeader 
            stock={selectedStock}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            activeTimeframe={activeTimeframe}
            onTimeframeChange={setActiveTimeframe}
            isReplaying={isReplaying}
            isSelectingReplayStart={isSelectingReplayStart}
            replayIndex={replayIndex}
            totalBars={totalBars}
            onStartReplay={handleStartReplaySelection}
            onCancelReplay={handleCancelReplaySelection}
            onReplayNext={handleReplayNext}
            onStopReplay={handleStopReplay}
            onGoToRealtime={handleGoToRealtime}
            onOpenSearch={() => setIsSearchModalOpen(true)}
            onOpenIndicator={() => setIsIndicatorModalOpen(true)}
            activeIndicatorCount={activeIndicators.length}
          />
          
          {activeTab === 'chart' && (
            <div className="flex flex-col flex-1">
              <div className="flex flex-col h-[550px] shrink-0 overflow-hidden border-b border-[#2a2e39]">
                <ChartArea
                  activeTool={activeTool}
                  selectedStock={selectedStock}
                  activeTimeframe={activeTimeframe}
                  isReplaying={isReplaying}
                  isSelectingReplayStart={isSelectingReplayStart}
                  onSelectReplayStart={handleConfirmReplayStart}
                  replayIndex={replayIndex}
                  goToRealtimeTrigger={goToRealtimeTrigger}
                  onDataLoaded={setTotalBars}
                  tradeOrders={tradeOrders.filter(o => o.symbol === selectedStock.symbol)}
                  activeIndicators={activeIndicators}
                  activePosition={positions[selectedStock.symbol] as any}
                  chartSettings={chartSettings}
                  onPriceUpdate={(price) => {
                    setSelectedStock(prev => {
                      if (prev.price === price) return prev;
                      const basePrice = STOCKS.find(s => s.symbol === prev.symbol)?.price || prev.price;
                      const change = price - basePrice;
                      const percent = (change / basePrice) * 100;
                      return { ...prev, price, change, percent, type: change >= 0 ? 'up' : 'down' };
                    });
                  }}
                />
              </div>
              <BottomPanel 
                refreshTrigger={tradeCount} 
                positions={positions as any} 
                currentStock={selectedStock} 
                onClosePosition={handleCloseSpecificPosition} 
              />
            </div>
          )}
          
          {activeTab === 'coin_info' && (
            <CoinInfoPanel stock={selectedStock} />
          )}
          {activeTab === 'info' && (
            <ContractInfoPanel stock={selectedStock} />
          )}
        </div>

        <div className="flex shrink-0">
          {activeRightPanel === 'watchlist' && (
            <WatchlistPanel
              watchlists={watchlists}
              activeWatchlistId={activeWatchlistId}
              onWatchlistChange={setActiveWatchlistId}
              onUpdateWatchlist={handleUpdateWatchlist}
              onCreateWatchlist={handleCreateWatchlist}
              onDeleteWatchlist={handleDeleteWatchlist}
              onRenameWatchlist={handleRenameWatchlist}
              onSelectStock={handleStockSelect}
              currentSymbol={selectedStock.symbol}
            />
          )}
          
          {activeRightPanel === 'order' && (
            <RightSidebar
              selectedStock={selectedStock}
              positions={positions}
              balance={balance}
              onStockSelect={handleStockSelect}
              onTrade={handleTrade}
              onUpdateTPSL={handleUpdateTPSL}
              onAddMargin={handleAddMargin}
            />
          )}

          {activeRightPanel === 'simulation' && (
            <SimulationPanel
              currentSymbol={selectedStock.symbol}
              onStartSimulation={handleStartSimulation}
            />
          )}

          {activeRightPanel === 'calculator' && (
            <CalculatorPanel
              initialBalance={balance}
              currentStock={selectedStock}
            />
          )}

          <RightToolbar 
            activePanel={activeRightPanel} 
            onChangePanel={setActiveRightPanel} 
          />
        </div>
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
      
      {isSettingsModalOpen && (
        <ChartSettingsModal 
          onClose={() => setIsSettingsModalOpen(false)} 
          chartSettings={chartSettings}
          onSettingsChange={setChartSettings}
        />
      )}
    </div>
  );
};
