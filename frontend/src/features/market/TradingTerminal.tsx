import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChartArea } from './components/ChartArea';
import { RightSidebar } from './components/RightSidebar';
import { RightToolbar } from './components/RightToolbar';
import { WatchlistPanel, type Watchlist } from './components/WatchlistPanel';
import { SimulationPanel, type SimulationConfig } from './components/SimulationPanel';
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
import { BottomPanel } from './components/BottomPanel';
import { TickerHeader } from './components/TickerHeader';
import { CoinInfoPanel } from './components/CoinInfoPanel';
import { ContractInfoPanel } from './components/ContractInfoPanel';
import { tradingApi } from '../../services/tradingApi';
import { SimulatorTradingPanel } from './components/SimulatorTradingPanel';
import { PositionsManager } from './components/PositionsManager';
import { useSimulatorStore } from './engine/useSimulatorStore';
import { useNotificationStore } from '../../stores/useNotificationStore';

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
  const { simulationId } = useParams<{ simulationId?: string }>();
  const navigate = useNavigate();

  const [activeTool, setActiveTool] = useState<string>('cursor');
  const [selectedStock, setSelectedStock] = useState<Stock>(() => {
    if (simulationId) {
      const match = STOCKS.find(s => s.symbol.toLowerCase() === simulationId.toLowerCase());
      if (match) return match;
    }
    const saved = localStorage.getItem('lastSelectedStock');
    if (saved) {
      const match = STOCKS.find(s => s.symbol.toLowerCase() === saved.toLowerCase());
      if (match) return match;
    }
    return STOCKS[0];
  });

  const [tradeOrders, setTradeOrders] = useState<TradeOrder[]>([]);
  const [activeTimeframe, setActiveTimeframe] = useState<string>('D');
  const [balance, setBalance] = useState<number>(100_000_000);
  const [positions, setPositions] = useState<Record<string, { quantity: number, averagePrice: number, side: 'LONG' | 'SHORT', leverage: number, tp?: number, sl?: number }>>({});
  const store = useSimulatorStore();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isIndicatorModalOpen, setIsIndicatorModalOpen] = useState(false);
  const [activeIndicators, setActiveIndicators] = useState<string[]>([]);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [tradeCount, setTradeCount] = useState(0);
  const [toast, setToast] = useState<{ msg: string, type: 'info' | 'warning' } | null>(null);
  const [editingSymbol, setEditingSymbol] = useState<string | null>(null);

  const [activeRightPanel, setActiveRightPanel] = useState<'watchlist' | 'order' | 'simulation' | 'calculator' | null>('watchlist');

  const { user } = useAuth();
  const { addNotification } = useNotificationStore();

  const [watchlists, setWatchlists] = useState<Watchlist[]>(() => {
    try {
      const saved = localStorage.getItem('watchlists');
      if (saved) return JSON.parse(saved);
    } catch { }
    return [{ id: '1', name: 'Danh sách của tôi', symbols: ['BTCUSDT', 'ETHUSDT', 'FPT', 'VNINDEX'] }];
  });

  // Fetch watchlists from API if user is logged in
  useEffect(() => {
    const fetchAPI = async () => {
      if (user) {
        try {
          const data = await getWatchlists();
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

    if (user) {
      try {
        await apiUpdateWatchlist(id, { symbols });
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

    if (user) {
      try {
        const created = await apiCreateWatchlist({ name, symbols: [] });
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

    if (user) {
      try {
        await apiDeleteWatchlist(id);
      } catch (error) {
        console.error("Failed to delete watchlist on server", error);
      }
    }
  };

  const handleRenameWatchlist = async (id: string, newName: string) => {
    setWatchlists(prev => prev.map(w => w.id === id ? { ...w, name: newName } : w));

    if (user) {
      try {
        await apiUpdateWatchlist(id, { name: newName });
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

  const showToast = (msg: string, type: 'info' | 'warning' = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Bar Replay state
  const [isReplaying, setIsReplaying] = useState(false);
  const [isSelectingReplayStart, setIsSelectingReplayStart] = useState(false);
  const [replayIndex, setReplayIndex] = useState(0);
  const [totalBars, setTotalBars] = useState(1000);
  const [goToRealtimeTrigger, setGoToRealtimeTrigger] = useState(0);

  // Added missing states
  const [activeTab, setActiveTab] = useState<'chart' | 'coin_info' | 'info'>('chart');

  const handleToolClick = (toolName: string) => {
    setActiveTool(toolName === activeTool && toolName !== 'cursor' ? activeTool : toolName);
  };

  useEffect(() => {
    if (simulationId) {
      const match = STOCKS.find(s => s.symbol.toLowerCase() === simulationId.toLowerCase());
      if (match && match.symbol !== selectedStock.symbol) {
        setSelectedStock(match);
      }
    }
  }, [simulationId]);

  useEffect(() => {
    if (selectedStock?.symbol) {
      localStorage.setItem('lastSelectedStock', selectedStock.symbol.toLowerCase());
    }
  }, [selectedStock]);

  const handleStockSelect = (stock: Stock) => {
    setSelectedStock(stock);
    localStorage.setItem('lastSelectedStock', stock.symbol.toLowerCase());
    navigate(`/trade/${stock.symbol.toLowerCase()}`, { replace: true });
    if (isReplaying || isSelectingReplayStart) {
      setIsReplaying(false);
      setIsSelectingReplayStart(false);
      setReplayIndex(0);
    }
  };

  const handlePriceChange = (newPrice: number) => {
    setSelectedStock(prev => prev.price === newPrice ? prev : { ...prev, price: newPrice });
  };

  const fetchPortfolio = async () => {
    try {
      const res = await tradingApi.getPortfolio();
      if (res.success && res.data) {
        if (res.data.wallet) {
          setBalance(res.data.wallet.availableBalance);
        }
        if (res.data.holdings) {
          const newPositions: Record<string, { quantity: number, averagePrice: number, side: 'LONG' | 'SHORT', leverage: number, tp?: number, sl?: number }> = {};
          res.data.holdings.forEach((h: any) => {
            newPositions[h.symbol] = { quantity: h.quantity, averagePrice: h.averagePrice, side: h.side, leverage: h.leverage, tp: h.tp, sl: h.sl };
          });
          setPositions(newPositions);
        }
        if (res.data.pendingOrders) {
          setPendingOrders(res.data.pendingOrders);
        }
      }
    } catch (e) {
      console.error('Failed to fetch portfolio', e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPortfolio();
    } else {
      setPositions({});
      setPendingOrders([]);
      setTradeOrders([]);
      setBalance(100_000_000);
      store.reset();
    }
  }, [user]);

  const handleTrade = async (type: 'buy' | 'sell' | 'close' | 'limit_buy' | 'limit_sell' | 'stop_buy' | 'stop_sell', price: number, margin: number, leverage: number, tp?: number, sl?: number) => {
    try {
      if (type === 'close') {
        const pos = positions[selectedStock.symbol];
        if (!pos) return { success: false, message: 'Không có vị thế để đóng' };

        const res = await tradingApi.closePosition(selectedStock.symbol, pos.side, price);
        if (res.success) {
          await fetchPortfolio();
          setTradeCount(c => c + 1);
          addNotification({ title: 'Đóng vị thế', message: `Đã chốt vị thế ${pos.side} mã ${selectedStock.symbol} thành công.`, type: 'success' });
          return { success: true, message: `✅ Đã chốt vị thế ${pos.side} thành công` };
        }
      } else if (type === 'limit_buy' || type === 'limit_sell') {
        const side = type === 'limit_buy' ? 'LONG' : 'SHORT';
        const res = await tradingApi.placeLimitOrder(selectedStock.symbol, side, price, margin, leverage, sl, tp, 'LIMIT');
        if (res.success) {
          await fetchPortfolio();
          setTradeCount(c => c + 1);
          addNotification({ title: 'Đặt lệnh Limit', message: `Lệnh ${side} Limit mã ${selectedStock.symbol} tại giá ${price.toLocaleString('vi-VN')} đã được đặt.`, type: 'info' });
          return { success: true, message: res.message };
        }
      } else if (type === 'stop_buy' || type === 'stop_sell') {
        const side = type === 'stop_buy' ? 'LONG' : 'SHORT';
        const res = await tradingApi.placeLimitOrder(selectedStock.symbol, side, price, margin, leverage, sl, tp, 'STOP');
        if (res.success) {
          await fetchPortfolio();
          setTradeCount(c => c + 1);
          addNotification({ title: 'Đặt lệnh Stop', message: `Lệnh ${side} Stop mã ${selectedStock.symbol} tại giá ${price.toLocaleString('vi-VN')} đã được đặt.`, type: 'info' });
          return { success: true, message: res.message };
        }
      } else if (type === 'buy') {
        const res = await tradingApi.buyStock(selectedStock.symbol, margin, leverage, price, sl, tp);
        if (res.success) {
          await fetchPortfolio();
          const order: TradeOrder = {
            id: `${Date.now()}-${Math.random()}`,
            type, symbol: selectedStock.symbol, price, qty: (margin * leverage) / price, timestamp: Date.now(), tp, sl,
          };
          setTradeOrders(prev => [...prev, order]);
          setTradeCount(c => c + 1);
          addNotification({ title: 'Mở vị thế LONG', message: `Đã mở LONG ${selectedStock.symbol} tại giá ${price.toLocaleString('vi-VN')} đòn bẩy ${leverage}x.`, type: 'success' });
          return { success: true, message: `✅ Mở LONG ${selectedStock.symbol} thành công` };
        }
      } else if (type === 'sell') {
        const res = await tradingApi.sellStock(selectedStock.symbol, margin, leverage, price);
        if (res.success) {
          await fetchPortfolio();
          const order: TradeOrder = {
            id: `${Date.now()}-${Math.random()}`,
            type, symbol: selectedStock.symbol, price, qty: (margin * leverage) / price, timestamp: Date.now(), tp, sl,
          };
          setTradeOrders(prev => [...prev, order]);
          setTradeCount(c => c + 1);
          addNotification({ title: 'Mở vị thế SHORT', message: `Đã mở SHORT ${selectedStock.symbol} tại giá ${price.toLocaleString('vi-VN')} đòn bẩy ${leverage}x.`, type: 'success' });
          return { success: true, message: `✅ Mở SHORT ${selectedStock.symbol} thành công` };
        }
      }
    } catch (error: any) {
      return { success: false, message: error.message || 'Giao dịch thất bại' };
    }
    return { success: false, message: 'Lỗi không xác định' };
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const res = await tradingApi.cancelLimitOrder(orderId);
      if (res.success) {
        await fetchPortfolio();
        setTradeCount(c => c + 1);
        showToast('Đã hủy lệnh chờ thành công!', 'info');
        addNotification({ title: 'Hủy lệnh', message: `Lệnh chờ đã bị hủy.`, type: 'warning' });
      }
    } catch (e: any) {
      showToast(e.message || 'Hủy lệnh thất bại', 'warning');
    }
  };

  const handleUpdateTPSL = async (tp?: number, sl?: number) => {
    try {
      const pos = positions[selectedStock.symbol];
      if (!pos) return { success: false, message: 'Không có vị thế' };

      const res = await tradingApi.updateTPSL(selectedStock.symbol, pos.side, tp, sl);
      if (res.success) {
        await fetchPortfolio();
        addNotification({ title: 'Cập nhật TP/SL', message: `Đã cập nhật Chốt lời/Cắt lỗ cho vị thế ${pos.side} mã ${selectedStock.symbol}.`, type: 'info' });
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
        addNotification({ title: 'Đóng vị thế', message: `Đã chốt vị thế ${pos.side} mã ${symbolToClose}.`, type: 'success' });
        return { success: true, message: `✅ Đã chốt vị thế ${symbolToClose} thành công` };
      }
      return { success: false, message: res.message || 'Lỗi đóng lệnh' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Lỗi hệ thống' };
    }
  };

  const handleAddMargin = async (symbol: string, side: 'LONG' | 'SHORT', amount: number) => {
    try {
      const res = await tradingApi.addMargin(symbol, side, amount);
      if (res.success) {
        await fetchPortfolio();
        addNotification({ title: 'Thêm ký quỹ', message: `Đã bơm thêm ${amount.toLocaleString('vi-VN')}₫ ký quỹ cho vị thế ${side} mã ${symbol}.`, type: 'info' });
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
    let execPrice = currentPrice;

    if (pos.side === 'LONG') {
      pnl = (currentPrice - pos.averagePrice) * pos.quantity;
      if (pos.sl && currentPrice <= pos.sl) { shouldClose = true; reason = 'Chạm Cắt Lỗ (SL)'; execPrice = pos.sl; }
      if (pos.tp && currentPrice >= pos.tp) { shouldClose = true; reason = 'Chạm Chốt Lời (TP)'; execPrice = pos.tp; }
    } else if (pos.side === 'SHORT') {
      pnl = (pos.averagePrice - currentPrice) * pos.quantity;
      if (pos.sl && currentPrice >= pos.sl) { shouldClose = true; reason = 'Chạm Cắt Lỗ (SL)'; execPrice = pos.sl; }
      if (pos.tp && currentPrice <= pos.tp) { shouldClose = true; reason = 'Chạm Chốt Lời (TP)'; execPrice = pos.tp; }
    }

    // Liquidation Check
    if (pnl <= -actualMargin) {
      shouldClose = true;
      reason = 'Thanh lý (Cháy tài khoản)';
      execPrice = currentPrice; // Liquidate at market
    }

    if (shouldClose) {
      const key = `${selectedStock.symbol}_${pos.side}`;
      if ((window as any)[`isClosing_${key}`]) return;
      (window as any)[`isClosing_${key}`] = true;

      handleTrade('close', execPrice, 0, 0).then(res => {
        (window as any)[`isClosing_${key}`] = false;
        if (res.success) {
          showToast(`⚠️ HỆ THỐNG TỰ ĐỘNG ĐÓNG VỊ THẾ!\nLý do: ${reason}\nGiá: ${execPrice.toLocaleString('vi-VN')}₫`, 'warning');
          addNotification({ title: 'Đóng lệnh tự động', message: `Vị thế ${pos.side} mã ${selectedStock.symbol} tự động đóng do: ${reason}.`, type: 'warning' });
        }
      }).catch(() => {
        (window as any)[`isClosing_${key}`] = false;
      });
    }
  }, [selectedStock.price, positions, selectedStock.symbol]);

  // Auto Execute Limit & Stop Orders
  useEffect(() => {
    const currentPrice = selectedStock.price;
    const symbolOrders = pendingOrders.filter(o => o.symbol === selectedStock.symbol);

    symbolOrders.forEach(order => {
      const key = `executing_order_${order._id}`;
      if ((window as any)[key]) return;

      let shouldExecute = false;
      if (order.type === 'LIMIT') {
        if (order.side === 'LONG' && currentPrice <= order.price) {
          shouldExecute = true;
        } else if (order.side === 'SHORT' && currentPrice >= order.price) {
          shouldExecute = true;
        }
      } else if (order.type === 'STOP') {
        if (order.side === 'LONG' && currentPrice >= order.price) {
          shouldExecute = true;
        } else if (order.side === 'SHORT' && currentPrice <= order.price) {
          shouldExecute = true;
        }
      }

      if (shouldExecute) {
        (window as any)[key] = true;
        // Khớp lệnh: 1. Hủy lệnh chờ, 2. Mở lệnh thật
        tradingApi.cancelLimitOrder(order._id)
          .then(() => {
            if (order.side === 'LONG') {
              return tradingApi.buyStock(order.symbol, order.margin, order.leverage, order.price, order.stopLoss, order.takeProfit);
            } else {
              return handleTrade(order.side === 'LONG' ? 'buy' : 'sell', order.price, order.margin, order.leverage, order.takeProfit, order.stopLoss);
            }
          })
          .then(() => {
            fetchPortfolio();
            showToast(`✅ Lệnh chờ ${order.side} Limit tại ${order.price.toLocaleString()}đ đã khớp!`, 'info');
            addNotification({ title: 'Khớp lệnh chờ', message: `Lệnh ${order.type} ${order.side} mã ${order.symbol} đã khớp tại giá ${order.price.toLocaleString('vi-VN')}₫.`, type: 'success' });
          })
          .finally(() => {
            (window as any)[key] = false;
          });
      }
    });
  }, [selectedStock.price, pendingOrders, selectedStock.symbol]);

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
        <LeftToolbar activeTool={activeTool} onToolSelect={handleToolClick} />
        <div className="flex flex-col flex-1 overflow-hidden">
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
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="flex flex-col flex-1 min-h-[300px] overflow-hidden border-b border-[#2a2e39]">
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
                  pendingOrders={store.isActive ? store.orders.map(o => ({ ...o, price: o.limitPrice, quantity: o.lot })) : pendingOrders}
                  activeIndicators={activeIndicators}
                  activePosition={
                    store.isActive 
                      ? (store.positions.find(p => p.symbol === selectedStock.symbol) ? {
                          quantity: store.positions.find(p => p.symbol === selectedStock.symbol)!.lot,
                          averagePrice: store.positions.find(p => p.symbol === selectedStock.symbol)!.entryPrice,
                          side: store.positions.find(p => p.symbol === selectedStock.symbol)!.side,
                          leverage: store.session!.config.leverage,
                          tp: store.positions.find(p => p.symbol === selectedStock.symbol)!.tp,
                          sl: store.positions.find(p => p.symbol === selectedStock.symbol)!.sl
                        } : undefined)
                      : (positions[selectedStock.symbol] as any)
                  }
                  chartSettings={chartSettings}
                  onPriceUpdate={(price, timestamp) => {
                    setSelectedStock(prev => {
                      if (prev.price === price) return prev;
                      const basePrice = STOCKS.find(s => s.symbol === prev.symbol)?.price || prev.price;
                      const change = price - basePrice;
                      const percent = (change / basePrice) * 100;
                      return { ...prev, price, change, percent, type: change >= 0 ? 'up' : 'down' };
                    });
                    handlePriceChange(price);
                    
                    if (store.isActive && store.session) {
                      store.tick(price, timestamp ? new Date(timestamp).toISOString() : new Date().toISOString());
                    }
                  }}
                />
              </div>
              
              {store.isActive && store.session ? (
                <PositionsManager currentPrice={selectedStock.price} />
              ) : (
                <BottomPanel
                  positions={positions as any}
                  pendingOrders={pendingOrders}
                  selectedSymbol={selectedStock.symbol}
                  currentPrice={selectedStock.price}
                  onClosePosition={async (symbol, side, price) => {
                    try {
                      const res = await tradingApi.closePosition(symbol, side, price);
                      if (res.success) {
                        await fetchPortfolio();
                        setTradeCount(c => c + 1);
                        addNotification({
                          title: 'Đóng vị thế',
                          message: `Đã chốt vị thế ${side} mã ${symbol} thành công ở giá ${price.toLocaleString('vi-VN')}đ.`,
                          type: 'success'
                        });
                        return { success: true, message: `✅ Đã chốt vị thế ${side} ${symbol}` };
                      }
                      return { success: false, message: 'Lỗi khi đóng vị thế' };
                    } catch (e: any) {
                      return { success: false, message: e.message };
                    }
                  }}
                  onCancelOrder={handleCancelOrder}
                  onUpdateTPSL={async (symbol, side, tp, sl) => {
                    try {
                      const res = await tradingApi.updateTPSL(symbol, side, tp, sl);
                      if (res.success) {
                        await fetchPortfolio();
                        return { success: true, message: '✅ Đã cập nhật TP/SL' };
                      }
                      return { success: false, message: 'Lỗi cập nhật' };
                    } catch (e: any) {
                      return { success: false, message: e.message };
                    }
                  }}
                  onAddMargin={handleAddMargin}
                  onEditPosition={(symbol) => {
                    const stock = STOCKS.find(s => s.symbol === symbol);
                    if (stock) handleStockSelect(stock);
                    setEditingSymbol(symbol);
                    setActiveRightPanel('order');
                  }}
                  refreshTrigger={tradeCount}
                />
              )}
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
            store.isActive ? (
              <SimulatorTradingPanel
                selectedStock={selectedStock}
              />
            ) : (
              <RightSidebar
                selectedStock={selectedStock}
                positions={positions}
                balance={balance}
                onStockSelect={(stock) => {
                  handleStockSelect(stock);
                  setEditingSymbol(null);
                }}
                onTrade={handleTrade}
                onUpdateTPSL={async (symbol, side, tp, sl) => {
                  const res = await handleUpdateTPSL(tp, sl);
                  if (res.success) setEditingSymbol(null);
                  return res;
                }}
                onAddMargin={handleAddMargin}
                isEditing={editingSymbol === selectedStock.symbol}
                onCancelEdit={() => setEditingSymbol(null)}
              />
            )
          )}

          {activeRightPanel === 'simulation' && (
            <SimulationPanel
              currentSymbol={selectedStock.symbol}
              isReplaying={isReplaying}
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

      {toast && (
        <div className="fixed top-4 right-1/2 translate-x-1/2 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-lg shadow-xl border flex items-center gap-3 ${toast.type === 'warning'
              ? 'bg-red-900/90 border-red-500 text-red-100'
              : 'bg-green-900/90 border-green-500 text-green-100'
            }`}>
            <span className="font-medium whitespace-pre-line text-sm">{toast.msg}</span>
          </div>
        </div>
      )}

      <SymbolSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelect={(stock) => {
          handleStockSelect(stock);
          setIsSearchModalOpen(false);
        }}
      />
      <IndicatorModal
        isOpen={isIndicatorModalOpen}
        onClose={() => setIsIndicatorModalOpen(false)}
        activeIndicators={activeIndicators}
        onToggle={(ind) => {
          setActiveIndicators(prev => 
            prev.includes(ind) ? prev.filter(i => i !== ind) : [...prev, ind]
          );
        }}
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
