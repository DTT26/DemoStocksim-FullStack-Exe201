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
import { PositionsManager } from './components/PositionsManager';
import { useSimulatorStore } from './engine/useSimulatorStore';
import { useNotificationStore } from '../../stores/useNotificationStore';
import { Trophy, RefreshCw, ChevronRight, Pause, Play, Square } from 'lucide-react';
import { challengeApi } from '../../services/challengeApi';
import type { UserChallengeState, ChallengeLevelConfig } from '../challenge/types';
import { ChallengeModal } from '../challenge/ChallengeModal';
import { useModal } from '../../contexts/ModalContext';

const MAX_RESETS_PER_WEEK = 4;

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
  const { showAlert, showConfirm } = useModal();
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
  const [balance, setBalance] = useState<number>(10_000);
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

  const { user, login } = useAuth();
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

  // Toggles for lower toolbar buttons
  const [magnetMode, setMagnetMode] = useState(false);
  const [stayInDrawingMode, setStayInDrawingMode] = useState(false);
  const [lockDrawing, setLockDrawing] = useState(false);
  const [hideDrawing, setHideDrawing] = useState(false);

  const showToast = (msg: string, type: 'info' | 'warning' = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Bar Replay state
  const [isReplaying, setIsReplaying] = useState(false);
  const [isSelectingReplayStart, setIsSelectingReplayStart] = useState(false);
  const [replayTime, setReplayTime] = useState<number | null>(null);
  const [replayStepTrigger, setReplayStepTrigger] = useState(0);
  const [totalBars, setTotalBars] = useState(1000);
  const [goToRealtimeTrigger, setGoToRealtimeTrigger] = useState(0);

  // Added missing states
  const [activeTab, setActiveTab] = useState<'chart' | 'coin_info' | 'info'>('chart');
  const [previewTPSL, setPreviewTPSL] = useState<{ tp?: number; sl?: number; side?: 'LONG' | 'SHORT'; enabled: boolean } | null>(null);
  const [draggedTPSL, setDraggedTPSL] = useState<{ tp?: number; sl?: number } | null>(null);

  const handleToolClick = (toolName: string) => {
    if (toolName === activeTool && toolName !== 'cursor') {
      setActiveTool('cursor');
      setTimeout(() => setActiveTool(toolName), 10);
    } else {
      setActiveTool(toolName);
    }
  };

  // Undo / Redo triggers & state
  const [undoTrigger, setUndoTrigger] = useState(0);
  const [redoTrigger, setRedoTrigger] = useState(0);
  const [undoRedoState, setUndoRedoState] = useState({ canUndo: false, canRedo: false });

  // Authentication & 6-Level Prop Trading Challenge State (100% Backend Sync)
  const [challengeLevels, setChallengeLevels] = useState<ChallengeLevelConfig[]>([]);
  const [challengeState, setChallengeState] = useState<UserChallengeState>({
    currentLevel: 1,
    unlockedLevels: [1],
    status: 'NOT_STARTED',
    startingCapitalUSD: 10_000,
    dayStartEquityUSD: 10_000,
    currentEquityUSD: 10_000,
    currentBalanceUSD: 10_000,
    totalProfitUSD: 0,
    dailyLossUSD: 0,
    maxLossUSD: 0,
    tradingDaysCount: 0,
    tradingDates: [],
    resetsUsedThisWeek: 0,
    weekResetTimestamp: 0,
    certificates: [],
  });
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);

  // Tải cấu hình cấp độ từ Backend API
  useEffect(() => {
    challengeApi.getLevels().then(res => {
      if (res && res.success && res.levels) {
        setChallengeLevels(res.levels);
      }
    }).catch(err => {
      console.warn('Lỗi tải cấp độ từ backend:', err);
    });
  }, []);

  const currentChallengeLevel = challengeLevels.find(l => l.id === challengeState.currentLevel) || challengeLevels[0] || {
    id: 1,
    levelName: 'Tập Sự',
    badge: 'Cấp 1',
    capitalUSD: 10_000,
    capitalVND: 250_000_000,
    profitTargetPercent: 8,
    dailyLossLimitPercent: 4,
    maxDrawdownPercent: 8,
    minTradingDays: 2,
    maxLeverage: 20,
  };

  // Tính toán Cấp độ cao nhất tài khoản đã đạt được (để hiển thị khi không trong bài thi)
  const maxCertLevel = challengeState.certificates && challengeState.certificates.length > 0
    ? Math.max(...challengeState.certificates.map(c => c.levelId))
    : 0;
  const maxUnlockedLevel = challengeState.unlockedLevels && challengeState.unlockedLevels.length > 0
    ? Math.max(...challengeState.unlockedLevels)
    : 1;
  const accountRankLevelId = Math.max(maxCertLevel, maxUnlockedLevel);
  const accountRankConfig = challengeLevels.find(l => l.id === accountRankLevelId) || {
    id: accountRankLevelId,
    levelName: accountRankLevelId === 6 ? 'Bậc Thầy' : `Level ${accountRankLevelId}`,
    badge: `Cấp ${accountRankLevelId}`
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
    setPreviewTPSL(null);
    setDraggedTPSL(null);
    localStorage.setItem('lastSelectedStock', stock.symbol.toLowerCase());
    navigate(`/trade/${stock.symbol.toLowerCase()}`, { replace: true });
    if (isReplaying || isSelectingReplayStart) {
      setIsReplaying(false);
      setIsSelectingReplayStart(false);
      setReplayTime(null);
    }
  };

  const fetchPortfolio = async (targetUserId?: string) => {
    try {
      const uid = targetUserId || user?._id;
      const res = await tradingApi.getPortfolio(uid);
      if (res.success && res.data) {
        if (res.data.wallet) {
          setBalance(res.data.wallet.availableBalance);
        }
        if (res.data.holdings && Array.isArray(res.data.holdings)) {
          const newPositions: Record<string, { quantity: number, averagePrice: number, side: 'LONG' | 'SHORT', leverage: number, tp?: number, sl?: number }> = {};
          res.data.holdings.forEach((h: any) => {
            newPositions[h.symbol] = { quantity: h.quantity, averagePrice: h.averagePrice, side: h.side, leverage: h.leverage, tp: h.tp, sl: h.sl };
          });
          setPositions(newPositions);
        } else {
          setPositions({});
        }
        if (res.data.pendingOrders && Array.isArray(res.data.pendingOrders)) {
          setPendingOrders(res.data.pendingOrders);
        } else {
          setPendingOrders([]);
        }
      }
    } catch (e) {
      console.error('Failed to fetch portfolio', e);
    }
  };

  // Khi user đăng nhập hoặc đổi tài khoản, nạp đúng tiến trình thi từ Backend API
  useEffect(() => {
    if (user?._id) {
      challengeApi.getMyChallenge().then(async (res) => {
        if (res.success && res.challenge) {
          setChallengeState(res.challenge);
          if (res.challenge.status === 'ACTIVE' || res.challenge.status === 'PAUSED') {
            setBalance(res.challenge.currentBalanceUSD || res.challenge.startingCapitalUSD);
          }
          await fetchPortfolio(user._id);
        }
      }).catch(err => {
        console.warn('Backend getMyChallenge error:', err);
      });
      fetchPortfolio(user._id);
    } else {
      setPositions({});
      setPendingOrders([]);
      setTradeOrders([]);
      setBalance(100_000_000);
      store.reset();
      setChallengeState({
        currentLevel: 1,
        unlockedLevels: [1],
        status: 'NOT_STARTED',
        startingCapitalUSD: 10_000,
        dayStartEquityUSD: 10_000,
        currentEquityUSD: 10_000,
        currentBalanceUSD: 10_000,
        totalProfitUSD: 0,
        dailyLossUSD: 0,
        maxLossUSD: 0,
        tradingDaysCount: 0,
        tradingDates: [],
        resetsUsedThisWeek: 0,
        weekResetTimestamp: 0,
        certificates: [],
      });
      fetchPortfolio();
    }
  }, [user?._id]);

  // Ensure simulator store receives valid price immediately when active
  useEffect(() => {
    if (store.isActive && store.session && selectedStock?.price > 0) {
      if (store.currentPrice === 0) {
        store.tick(selectedStock.price, new Date().toISOString());
      }
    }
  }, [store.isActive, store.session, selectedStock?.price, store.currentPrice]);

  const calculateUnrealizedPnL = () => {
    let totalPnL = 0;
    Object.entries(positions).forEach(([sym, pos]) => {
      const currentPrice = sym === selectedStock.symbol ? selectedStock.price : (STOCKS.find(s => s.symbol === sym)?.price || pos.averagePrice);
      const diff = pos.side === 'LONG' ? (currentPrice - pos.averagePrice) : (pos.averagePrice - currentPrice);
      totalPnL += diff * pos.quantity;
    });
    return totalPnL;
  };

  // Đánh giá chỉ số rủi ro thời gian thực qua Backend Service
  useEffect(() => {
    if (challengeState.status === 'ACTIVE' && user?._id) {
      const uPnL = calculateUnrealizedPnL();
      challengeApi.evaluateRisk(uPnL, false).then(res => {
        if (res && res.success && res.challenge) {
          if (res.challenge.status !== challengeState.status || res.challenge.totalProfitUSD !== challengeState.totalProfitUSD) {
            setChallengeState(res.challenge);
            if (res.challenge.status === 'FAILED') {
              showToast(`❌ Bài thi đã vi phạm: ${res.challenge.breachReason}`, 'warning');
            } else if (res.challenge.status === 'PASSED') {
              showToast(`🏆 CHÚC MỪNG! Bạn đã hoàn thành xuất sắc bài thi Level ${res.challenge.currentLevel}!`, 'info');
            }
          }
        }
      }).catch(err => {
        console.error('Lỗi đánh giá rủi ro từ backend:', err);
      });
    }
  }, [selectedStock.price, positions, user?._id]);

  const handleChallengeStateUpdate = async (newState: UserChallengeState) => {
    setChallengeState(newState);
    if (newState.status === 'ACTIVE' || newState.status === 'PAUSED') {
      // Khi bắt đầu hoặc reset bài thi: Lập tức đặt số dư tương ứng với cấp độ đó và dọn trắng vị thế
      setBalance(newState.currentBalanceUSD || newState.startingCapitalUSD);
      setPositions({});
      setPendingOrders([]);
    }
    await fetchPortfolio(user?._id);
  };

  const handlePauseChallenge = async () => {
    try {
      const res = await challengeApi.pauseChallenge();
      if (res.success && res.challenge) {
        setChallengeState(res.challenge);
        showAlert({
          title: 'Tạm dừng bài thi',
          message: '⏸️ Đã tạm dừng bài thi cấp vốn. Giám sát rủi ro tạm thời được hoãn.',
          type: 'info'
        });
      }
    } catch (e: any) {
      showAlert({
        title: 'Lỗi tạm dừng bài thi',
        message: `Lỗi: ${e.message}`,
        type: 'error'
      });
    }
  };

  const handleResumeChallenge = async () => {
    try {
      const res = await challengeApi.resumeChallenge();
      if (res.success && res.challenge) {
        setChallengeState(res.challenge);
        showAlert({
          title: 'Tiếp tục bài thi',
          message: '▶️ Đã tiếp tục bài thi cấp vốn!',
          type: 'success'
        });
      }
    } catch (e: any) {
      showAlert({
        title: 'Lỗi tiếp tục bài thi',
        message: `Lỗi: ${e.message}`,
        type: 'error'
      });
    }
  };

  const handleEndChallenge = async () => {
    const confirmed = await showConfirm({
      title: 'Xác nhận kết thúc bài thi',
      message: 'Bạn có chắc chắn muốn KẾT THÚC bài thi này để quay về trạng thái tài khoản thường không?',
      type: 'danger',
      confirmText: 'Kết thúc bài thi',
      cancelText: 'Hủy bỏ',
    });
    if (!confirmed) {
      return;
    }
    try {
      const res = await challengeApi.endChallenge();
      if (res.success && res.challenge) {
        setChallengeState(res.challenge);
        setPositions({});
        setPendingOrders([]);
        await fetchPortfolio(user?._id); // Khôi phục lại 100% số dư và vị thế tài khoản thường trước khi thi
        showAlert({
          title: 'Đã kết thúc bài thi',
          message: '⏹️ Đã kết thúc bài thi cấp vốn. Đã khôi phục đầy đủ số dư và vị thế tài khoản thường của bạn!',
          type: 'success'
        });
      }
    } catch (e: any) {
      showAlert({
        title: 'Lỗi kết thúc bài thi',
        message: `Lỗi: ${e.message}`,
        type: 'error'
      });
    }
  };

  const handleUndo = () => {
    if (undoRedoState.canUndo) {
      setUndoTrigger(t => t + 1);
    }
  };

  const handleRedo = () => {
    if (undoRedoState.canRedo) {
      setRedoTrigger(t => t + 1);
    }
  };

  // Keyboard shortcut listener (Ctrl+Z: Undo, Ctrl+Y: Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        (e.ctrlKey || e.metaKey) &&
        (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))
      ) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoRedoState.canUndo, undoRedoState.canRedo]);

  const handleTPSLDragChange = (type: 'tp' | 'sl', price: number) => {
    setPreviewTPSL(prev => prev ? { ...prev, [type]: price } : { enabled: true, [type]: price });
    setDraggedTPSL(prev => ({ ...prev, [type]: price }));
  };

  const handlePriceChange = (newPrice: number) => {
    setSelectedStock(prev => prev.price === newPrice ? prev : { ...prev, price: newPrice });
  };

  const handleTrade = async (type: 'buy' | 'sell' | 'close' | 'limit_buy' | 'limit_sell' | 'stop_buy' | 'stop_sell', price: number, margin: number, leverage: number, tp?: number, sl?: number) => {
    if (!user) {
      login();
      return { success: false, message: 'Vui lòng đăng nhập để thực hiện giao dịch' };
    }
    try {
      if (type === 'close') {
        const pos = positions[selectedStock.symbol];
        if (!pos) return { success: false, message: 'Không có vị thế để đóng' };

        const res = await tradingApi.closePosition(selectedStock.symbol, pos.side, price, user._id);
        if (res.success) {
          await fetchPortfolio();
          setTradeCount(c => c + 1);
          addNotification({ title: 'Đóng vị thế', message: `Đã chốt vị thế ${pos.side} mã ${selectedStock.symbol} thành công.`, type: 'success' });
          return { success: true, message: `✅ Đã chốt vị thế ${pos.side} thành công` };
        }
      } else if (type === 'limit_buy' || type === 'limit_sell') {
        const side = type === 'limit_buy' ? 'LONG' : 'SHORT';
        const res = await tradingApi.placeLimitOrder(selectedStock.symbol, side, price, margin, leverage, sl, tp, 'LIMIT', user._id);
        if (res.success) {
          await fetchPortfolio();
          setTradeCount(c => c + 1);
          addNotification({ title: 'Đặt lệnh Limit', message: `Lệnh ${side} Limit mã ${selectedStock.symbol} tại giá ${price.toLocaleString('vi-VN')} đã được đặt.`, type: 'info' });
          return { success: true, message: res.message };
        }
      } else if (type === 'stop_buy' || type === 'stop_sell') {
        const side = type === 'stop_buy' ? 'LONG' : 'SHORT';
        const res = await tradingApi.placeLimitOrder(selectedStock.symbol, side, price, margin, leverage, sl, tp, 'STOP', user._id);
        if (res.success) {
          await fetchPortfolio();
          setTradeCount(c => c + 1);
          addNotification({ title: 'Đặt lệnh Stop', message: `Lệnh ${side} Stop mã ${selectedStock.symbol} tại giá ${price.toLocaleString('vi-VN')} đã được đặt.`, type: 'info' });
          return { success: true, message: res.message };
        }
      } else if (type === 'buy') {
        const res = await tradingApi.buyStock(selectedStock.symbol, margin, leverage, price, sl, tp, user._id);
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
        const res = await tradingApi.sellStock(selectedStock.symbol, margin, leverage, price, user._id);
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
    const confirmed = await showConfirm({
      title: 'Xác nhận hủy lệnh',
      message: 'Bạn có chắc chắn muốn hủy lệnh chờ này không?',
      type: 'warning',
      confirmText: 'Hủy lệnh',
      cancelText: 'Quay lại',
    });
    if (!confirmed) return;

    try {
      const res = await tradingApi.cancelLimitOrder(orderId, user?._id);
      if (res.success) {
        await fetchPortfolio();
        setTradeCount(c => c + 1);
        showToast('Đã hủy lệnh chờ thành công!', 'info');
        addNotification({ title: 'Hủy lệnh', message: `Lệnh chờ đã bị hủy.`, type: 'warning' });
        showAlert({
          title: 'Hủy lệnh',
          message: 'Đã hủy lệnh chờ thành công!',
          type: 'success'
        });
      }
    } catch (e: any) {
      showToast(e.message || 'Hủy lệnh thất bại', 'warning');
      showAlert({
        title: 'Hủy lệnh thất bại',
        message: e.message || 'Hủy lệnh thất bại',
        type: 'error'
      });
    }
  };

  const handleUpdateTPSL = async (tp?: number, sl?: number) => {
    try {
      const pos = positions[selectedStock.symbol];
      if (!pos) return { success: false, message: 'Không có vị thế' };

      const res = await tradingApi.updateTPSL(selectedStock.symbol, pos.side, tp, sl, user?._id);
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

      const res = await tradingApi.closePosition(symbolToClose, pos.side, currentPrice, user?._id);
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
      const res = await tradingApi.addMargin(symbol, side, amount, user?._id);
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
          showToast(`⚠️ HỆ THỐNG TỰ ĐỘNG ĐÓNG VỊ THẾ!\nLý do: ${reason}\nGiá: $${execPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 'warning');
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
        tradingApi.cancelLimitOrder(order._id, user?._id)
          .then(() => {
            if (order.side === 'LONG') {
              return tradingApi.buyStock(order.symbol, order.margin, order.leverage, order.price, order.stopLoss, order.takeProfit, user?._id);
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

  const handleConfirmReplayStart = (timestamp: number) => {
    setReplayTime(timestamp);
    setIsSelectingReplayStart(false);
    setIsReplaying(true);
  };


  const handleGoToRealtime = () => {
    if (isReplaying || isSelectingReplayStart) {
      setIsReplaying(false);
      setIsSelectingReplayStart(false);
      setReplayTime(null);
    }
    setGoToRealtimeTrigger(t => t + 1);
  };

  const handleReplayNext = () => {
    setReplayStepTrigger(t => t + 1);
  };

  const handleStartSimulation = (config: SimulationConfig) => {
    console.log("Start simulation with config:", config);
    // Only enter replay selection mode if replay is not already active
    if (!isReplaying) {
      setIsSelectingReplayStart(true);
    }
  };

  const handleStopReplay = () => {
    setIsReplaying(false);
    setReplayTime(null);
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-white dark:bg-[#131722] text-[#1e2329] dark:text-[#d1d4dc]">
      <ToolbarNavbar 
        balance={balance} 
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenChallenge={() => setIsChallengeModalOpen(true)}
        challengeLevelName={currentChallengeLevel.badge}
        challengeStatus={challengeState.status}
        accountRankBadge={accountRankConfig.badge}
        accountRankName={`${accountRankConfig.badge} - ${accountRankConfig.levelName}`}
        certCount={challengeState.certificates?.length || 0}
      />
      
      {/* Dynamic Prop Challenge Header Bar - Chỉ hiển thị khi đang trong bài thi hoặc có kết quả */}
      {challengeState.status !== 'NOT_STARTED' && (
        <div className="h-9 bg-[#161a24] border-b border-[#232936] flex items-center px-4 justify-between text-xs text-[#d1d4dc] shrink-0 animate-in fade-in duration-150">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>{currentChallengeLevel.levelName}</span>
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                challengeState.status === 'ACTIVE' 
                  ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30'
                  : challengeState.status === 'PAUSED'
                  ? 'bg-amber-900/30 text-amber-300 border-amber-500/30'
                  : challengeState.status === 'PASSED'
                  ? 'bg-purple-900/30 text-purple-400 border-purple-500/30'
                  : challengeState.status === 'FAILED'
                  ? 'bg-rose-900/30 text-rose-400 border-rose-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {challengeState.status === 'ACTIVE' && '🟢 ĐANG THI (LIVE)'}
                {challengeState.status === 'PAUSED' && '⏸️ ĐANG TẠM DỪNG'}
                {challengeState.status === 'PASSED' && '🏆 ĐÃ ĐỖ'}
                {challengeState.status === 'FAILED' && '🔴 BỊ VI PHẠM'}
              </span>
            </div>

            <div className="hidden md:flex items-center gap-4 border-l border-[#232936] pl-3 text-[11px]">
              {/* Target */}
              <div className="flex items-center gap-1">
                <span className="text-slate-400">Mục tiêu:</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {challengeState.totalProfitUSD >= 0 ? '+' : ''}${challengeState.totalProfitUSD.toLocaleString('en-US', { maximumFractionDigits: 0 })} / +${((currentChallengeLevel.capitalUSD * currentChallengeLevel.profitTargetPercent) / 100).toLocaleString('en-US')}
                </span>
              </div>

              {/* Daily Loss */}
              <div className="flex items-center gap-1">
                <span className="text-slate-400">Lỗ ngày:</span>
                <span className="font-bold text-amber-400 font-mono">
                  -${challengeState.dailyLossUSD.toLocaleString('en-US', { maximumFractionDigits: 0 })} / -${((currentChallengeLevel.capitalUSD * currentChallengeLevel.dailyLossLimitPercent) / 100).toLocaleString('en-US')}
                </span>
              </div>

              {/* Max Drawdown */}
              <div className="flex items-center gap-1">
                <span className="text-slate-400">Sụt giảm tối đa:</span>
                <span className="font-bold text-rose-400 font-mono">
                  -${challengeState.maxLossUSD.toLocaleString('en-US', { maximumFractionDigits: 0 })} / -${((currentChallengeLevel.capitalUSD * currentChallengeLevel.maxDrawdownPercent) / 100).toLocaleString('en-US')}
                </span>
              </div>

              {/* Reset Quota */}
              <div className="flex items-center gap-1 text-cyan-400">
                <RefreshCw className="w-3 h-3" />
                <span>Reset: <strong>{MAX_RESETS_PER_WEEK - challengeState.resetsUsedThisWeek}/{MAX_RESETS_PER_WEEK}</strong></span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {challengeState.status === 'ACTIVE' && (
              <button
                onClick={handlePauseChallenge}
                className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[11px] font-semibold transition-all"
                title="Tạm dừng bài thi để quay về giao dịch tự do"
              >
                <Pause className="w-3 h-3" />
                <span>Tạm Dừng</span>
              </button>
            )}

            {challengeState.status === 'PAUSED' && (
              <button
                onClick={handleResumeChallenge}
                className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 rounded text-[11px] font-bold transition-all"
                title="Tiếp tục bài thi cấp vốn"
              >
                <Play className="w-3 h-3" />
                <span>Tiếp Tục Thi</span>
              </button>
            )}

            {(challengeState.status === 'ACTIVE' || challengeState.status === 'PAUSED' || challengeState.status === 'FAILED') && (
              <button
                onClick={handleEndChallenge}
                className="flex items-center gap-1 px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded text-[11px] font-semibold transition-all"
                title="Hủy bài thi để trở về tài khoản thường"
              >
                <Square className="w-3 h-3" />
                <span>Hủy Thi</span>
              </button>
            )}

            <button
              onClick={() => setIsChallengeModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-[11px] font-bold transition-all"
            >
              <span>Chi Tiết Bài Thi</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <LeftToolbar 
          activeTool={activeTool} 
          onToolSelect={handleToolClick} 
          magnetMode={magnetMode}
          onToggleMagnet={() => setMagnetMode(!magnetMode)}
          stayInDrawingMode={stayInDrawingMode}
          onToggleStayInDrawingMode={() => setStayInDrawingMode(!stayInDrawingMode)}
          lockDrawing={lockDrawing}
          onToggleLock={() => setLockDrawing(!lockDrawing)}
          hideDrawing={hideDrawing}
          onToggleHide={() => setHideDrawing(!hideDrawing)}
        />
        <div className="flex flex-col flex-1 overflow-hidden">
          <TickerHeader
            stock={selectedStock}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            activeTimeframe={activeTimeframe}
            onTimeframeChange={setActiveTimeframe}
            isReplaying={isReplaying}
            isSelectingReplayStart={isSelectingReplayStart}
            replayTime={replayTime}
            totalBars={totalBars}
            isChallengeActive={challengeState.status === 'ACTIVE'}
            onStartReplay={handleStartReplaySelection}
            onCancelReplay={handleCancelReplaySelection}
            onReplayNext={handleReplayNext}
            onStopReplay={handleStopReplay}
            onGoToRealtime={handleGoToRealtime}
            onOpenSearch={() => setIsSearchModalOpen(true)}
            onOpenIndicator={() => setIsIndicatorModalOpen(true)}
            activeIndicatorCount={activeIndicators.length}
            canUndo={undoRedoState.canUndo}
            canRedo={undoRedoState.canRedo}
            onUndo={handleUndo}
            onRedo={handleRedo}
          />

          {activeTab === 'chart' && (
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="flex flex-col flex-1 min-h-[300px] overflow-hidden border-b border-[#2a2e39]">
                <ChartArea
                  activeTool={activeTool}
                  onToolSelect={setActiveTool}
                  magnetMode={magnetMode}
                  stayInDrawingMode={stayInDrawingMode}
                  lockDrawing={lockDrawing}
                  hideDrawing={hideDrawing}
                  selectedStock={selectedStock}
                  activeTimeframe={activeTimeframe}
                  isReplaying={isReplaying}
                  isSelectingReplayStart={isSelectingReplayStart}
                  onSelectReplayStart={handleConfirmReplayStart}
                  replayTime={replayTime}
                  replayStepTrigger={replayStepTrigger}
                  onReplayTimeChange={setReplayTime}
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
                  previewTPSL={previewTPSL}
                  onTPSLChange={handleTPSLDragChange}
                  undoTrigger={undoTrigger}
                  redoTrigger={redoTrigger}
                  onUndoRedoChange={setUndoRedoState}
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
                      const res = await tradingApi.closePosition(symbol, side, price, user?._id);
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
                      const res = await tradingApi.updateTPSL(symbol, side, tp, sl, user?._id);
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
            <RightSidebar
              selectedStock={selectedStock}
              positions={positions as any}
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
              onPreviewTPSLChange={setPreviewTPSL}
              draggedTPSL={draggedTPSL}
            />
          )}

          {activeRightPanel === 'simulation' && (
            <SimulationPanel
              currentSymbol={selectedStock.symbol}
              selectedStock={selectedStock}
              currentPrice={selectedStock.price}
              isReplaying={isReplaying}
              onStartSimulation={handleStartSimulation}
              onStartReplay={handleStartReplaySelection}
              onSelectStock={handleStockSelect}
              onPreviewTPSLChange={setPreviewTPSL}
              draggedTPSL={draggedTPSL}
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

      <ChallengeModal
        isOpen={isChallengeModalOpen}
        onClose={() => setIsChallengeModalOpen(false)}
        challengeState={challengeState}
        onStateUpdate={handleChallengeStateUpdate}
        userName={user?.name || 'Trader'}
      />
    </div>
  );
};
