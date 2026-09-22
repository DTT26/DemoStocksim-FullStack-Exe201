import { useState, useMemo, useEffect } from 'react';
import { HelpCircle, Play, ChevronDown, Calendar, ArrowRight, Edit3, BarChart2 } from 'lucide-react';
import { type Stock, STOCKS } from '../data';
import { AuthOverlay } from './AuthOverlay';
import { useAuth } from '../../../contexts/AuthContext';
import { getSessions, createSession, type PaperSession } from '../../../services/marketApi';
import { useSimulatorStore } from '../engine/useSimulatorStore';
import { CustomDatePicker } from '../../../components/CustomDatePicker';

interface SimulationPanelProps {
  currentSymbol: string;
  isReplaying: boolean;
  onStartSimulation: (config: SimulationConfig) => void;
}

export interface SimulationConfig {
  balance: number;
  leverage: number;
  minLot: number;
  lotStep: number;
  maxMarginPercent: number;
  spread: number;
  commission: number;
  swapLong: number;
  swapShort: number;
}

const DEFAULT_CONFIG: SimulationConfig = {
  balance: 10000,
  leverage: 1,
  minLot: 0.01,
  lotStep: 0.01,
  maxMarginPercent: 95,
  spread: 20,
  commission: 7,
  swapLong: -0.5,
  swapShort: -0.3,
};

export const SimulationPanel = ({ currentSymbol, isReplaying, onStartSimulation }: SimulationPanelProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'running' | 'completed'>('running');
  const [isCreating, setIsCreating] = useState(false);
  const [showReplayWarning, setShowReplayWarning] = useState(false);
  
  const [config, setConfig] = useState<SimulationConfig>(DEFAULT_CONFIG);

  const [sessions, setSessions] = useState<PaperSession[]>([]);

  const fetchSessions = async () => {
    if (user) {
      try {
        const data = await getSessions();
        setSessions(data);
      } catch (error) {
        console.error("Failed to fetch sessions", error);
      }
    } else {
      setSessions([]);
      if (store.isActive) {
        // Optionally end session, but it will be hidden anyway
      }
    }
  };

  useEffect(() => {
    fetchSessions();
    const handleSessionEnded = () => fetchSessions();
    window.addEventListener('simulator-session-ended', handleSessionEnded);
    return () => window.removeEventListener('simulator-session-ended', handleSessionEnded);
  }, [user]);

  const store = useSimulatorStore();

  // Filters for completed sessions
  const [symbolFilter, setSymbolFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [showSymbolDropdown, setShowSymbolDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const activeSessions = sessions.filter(s => s.status === 'running');
  const allCompletedSessions = sessions.filter(s => s.status === 'completed');

  // Get unique symbols from completed sessions
  const completedSymbols = useMemo(() => {
    const symbols = new Set(allCompletedSessions.map(s => s.symbol));
    return Array.from(symbols).sort();
  }, [allCompletedSessions]);

  // Apply filters
  const completedSessions = useMemo(() => {
    let filtered = allCompletedSessions;
    if (symbolFilter) {
      filtered = filtered.filter(s => s.symbol === symbolFilter);
    }
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      filtered = filtered.filter(s => {
        const d = new Date(s.completedAt || s.startedAt || '');
        return d >= from;
      });
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      filtered = filtered.filter(s => {
        const d = new Date(s.completedAt || s.startedAt || '');
        return d <= to;
      });
    }
    return filtered;
  }, [allCompletedSessions, symbolFilter, dateFrom, dateTo]);

  const handleChange = (field: keyof SimulationConfig, value: number) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleStart = async () => {
    onStartSimulation(config);
    if (!user) {
      setIsCreating(false);
      return;
    }

    try {
      const newSession = await createSession({
        symbol: currentSymbol,
        timeframe: 'D', // Hardcoded for now
        initialBalance: config.balance,
        leverage: config.leverage,
        minLot: config.minLot,
        lotStep: config.lotStep,
        maxMarginPercent: config.maxMarginPercent,
        spread: config.spread,
        commission: config.commission,
        swapLong: config.swapLong,
        swapShort: config.swapShort,
        replayStartTime: new Date().toISOString() // Should be from Replay State
      });
      
      setSessions(prev => [newSession, ...prev]);
      setIsCreating(false);

      // Start locally
      store.startSession({
        _id: newSession._id,
        name: newSession.name,
        symbol: newSession.symbol,
        timeframe: newSession.timeframe,
        config: {
          initialBalance: newSession.initialBalance,
          leverage: newSession.leverage,
          minLot: newSession.minLot,
          lotStep: newSession.lotStep,
          maxMarginPercent: newSession.maxMarginPercent,
          spread: newSession.spread,
          commission: newSession.commission,
          swapLong: newSession.swapLong,
          swapShort: newSession.swapShort,
        },
        balance: newSession.balance,
        equity: newSession.equity,
        usedMargin: newSession.usedMargin,
        freeMargin: newSession.freeMargin,
        replayStartTime: newSession.replayStartTime,
        replayCurrentTime: newSession.replayCurrentTime,
        status: newSession.status
      });
    } catch (error) {
      console.error("Failed to create session", error);
    }
  };

  if (isCreating) {
    return (
      <div className="w-[320px] border-l border-[#2a2e39] bg-[#131722] shrink-0 h-full flex flex-col text-[#d1d4dc] font-sans">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2e39] shrink-0">
          <h2 className="text-lg font-bold text-white">Bắt đầu phiên giao dịch</h2>
          <button className="w-6 h-6 rounded-full bg-[#1e222d] hover:bg-[#2a2e39] flex items-center justify-center text-[#787b86] transition-colors">
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-5">
          {/* SỐ DƯ BAN ĐẦU */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-white tracking-wider flex items-center gap-1.5 uppercase">
              Số dư ban đầu ($)
              <HelpCircle className="w-3.5 h-3.5 text-[#787b86]" />
            </label>
            <input 
              type="number"
              value={config.balance}
              onChange={e => handleChange('balance', parseFloat(e.target.value))}
              className="bg-[#1e222d] border border-[#2a2e39] focus:border-[#2962ff] rounded-md px-3 py-2.5 text-sm text-white font-mono outline-none transition-colors"
            />
          </div>

          {/* ĐÒN BẨY */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-white tracking-wider flex items-center gap-1.5 uppercase">
              Đòn bẩy (1-1000)
              <HelpCircle className="w-3.5 h-3.5 text-[#787b86]" />
            </label>
            <input 
              type="number"
              value={config.leverage}
              onChange={e => handleChange('leverage', parseFloat(e.target.value))}
              className="bg-[#1e222d] border border-[#2a2e39] focus:border-[#2962ff] rounded-md px-3 py-2.5 text-sm text-white font-mono outline-none transition-colors"
            />
          </div>

          {/* LOT */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-[11px] font-bold text-white tracking-wider uppercase">Lot tối thiểu</label>
              <input 
                type="number"
                step="0.01"
                value={config.minLot}
                onChange={e => handleChange('minLot', parseFloat(e.target.value))}
                className="bg-[#1e222d] border border-[#2a2e39] focus:border-[#2962ff] rounded-md px-3 py-2.5 text-sm text-white font-mono outline-none transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-[11px] font-bold text-white tracking-wider uppercase">Bước nhảy Lot</label>
              <input 
                type="number"
                step="0.01"
                value={config.lotStep}
                onChange={e => handleChange('lotStep', parseFloat(e.target.value))}
                className="bg-[#1e222d] border border-[#2a2e39] focus:border-[#2962ff] rounded-md px-3 py-2.5 text-sm text-white font-mono outline-none transition-colors"
              />
            </div>
          </div>

          {/* SỬ DỤNG KÝ QUỸ TỐI ĐA */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-white tracking-wider uppercase">
              Sử dụng ký quỹ tối đa (%)
            </label>
            <input 
              type="number"
              value={config.maxMarginPercent}
              onChange={e => handleChange('maxMarginPercent', parseFloat(e.target.value))}
              className="bg-[#1e222d] border border-[#2a2e39] focus:border-[#2962ff] rounded-md px-3 py-2.5 text-sm text-white font-mono outline-none transition-colors"
            />
            
            <div className="mt-1 bg-[#151924] rounded-md p-3 text-xs text-[#787b86] flex items-start gap-2 border border-[#1e222d]">
              <span className="text-yellow-500">💡</span>
              <p>
                Ký quỹ {config.minLot} lot: <strong className="text-white">${
                  ((STOCKS.find((s: Stock) => s.symbol === currentSymbol)?.price || 1000) * config.minLot / config.leverage).toFixed(2)
                }</strong> · Tối đa: <strong className="text-white">{
                  (((config.balance * config.maxMarginPercent / 100) * config.leverage) / (STOCKS.find((s: Stock) => s.symbol === currentSymbol)?.price || 1000)).toFixed(2)
                } lots</strong>
              </p>
            </div>
          </div>

          {/* SPREAD */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-white tracking-wider uppercase">Spread (điểm)</label>
            <input 
              type="number"
              value={config.spread}
              onChange={e => handleChange('spread', parseFloat(e.target.value))}
              className="bg-[#1e222d] border border-[#2a2e39] focus:border-[#2962ff] rounded-md px-3 py-2.5 text-sm text-white font-mono outline-none transition-colors"
            />
            <div className="bg-[#151924] rounded-md p-2.5 text-xs text-[#787b86]">
              20 pt ≈ 0.20
            </div>
          </div>

          {/* PHÍ HOA HỒNG */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-white tracking-wider flex items-center gap-1.5 uppercase">
              Phí hoa hồng mỗi lot ($)
              <HelpCircle className="w-3.5 h-3.5 text-[#787b86]" />
            </label>
            <input 
              type="number"
              value={config.commission}
              onChange={e => handleChange('commission', parseFloat(e.target.value))}
              className="bg-[#1e222d] border border-[#2a2e39] focus:border-[#2962ff] rounded-md px-3 py-2.5 text-sm text-white font-mono outline-none transition-colors"
            />
          </div>

          {/* PHÍ QUA ĐÊM LONG */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-white tracking-wider flex items-center gap-1.5 uppercase">
              Phí qua đêm Long ($/Lot/Đêm)
              <HelpCircle className="w-3.5 h-3.5 text-[#787b86]" />
            </label>
            <input 
              type="number"
              step="0.1"
              value={config.swapLong}
              onChange={e => handleChange('swapLong', parseFloat(e.target.value))}
              className="bg-[#1e222d] border border-[#2a2e39] focus:border-[#2962ff] rounded-md px-3 py-2.5 text-sm text-white font-mono outline-none transition-colors"
            />
          </div>

          {/* PHÍ QUA ĐÊM SHORT */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-white tracking-wider flex items-center gap-1.5 uppercase">
              Phí qua đêm Short ($/Lot/Đêm)
              <HelpCircle className="w-3.5 h-3.5 text-[#787b86]" />
            </label>
            <input 
              type="number"
              step="0.1"
              value={config.swapShort}
              onChange={e => handleChange('swapShort', parseFloat(e.target.value))}
              className="bg-[#1e222d] border border-[#2a2e39] focus:border-[#2962ff] rounded-md px-3 py-2.5 text-sm text-white font-mono outline-none transition-colors"
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-4 border-t border-[#2a2e39] flex gap-3 shrink-0">
          <button 
            onClick={() => setIsCreating(false)}
            className="flex-1 bg-transparent hover:bg-[#2a2e39] text-white font-bold py-2.5 rounded-md border border-[#2a2e39] transition-colors text-sm"
          >
            HỦY
          </button>
          <button 
            onClick={handleStart}
            className="flex-1 bg-[#089981] hover:bg-[#089981]/90 text-white font-bold py-2.5 rounded-md transition-colors text-sm"
          >
            BẮT ĐẦU
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[320px] border-l border-[#e6e8ea] dark:border-[#2a2e39] bg-white dark:bg-[#131722] shrink-0 h-full flex flex-col text-[#1e2329] dark:text-[#d1d4dc] font-sans relative">
      {!user ? (
        <AuthOverlay
          icon={<BarChart2 className="w-8 h-8" />}
          title="Mô phỏng Giao dịch"
          subtitle="Thực hành giao dịch không rủi ro bằng dữ liệu thực tế"
          features={[
            "Tua lại biểu đồ để kiểm tra chiến lược",
            "Mô phỏng chân thực với thanh khoản thị trường",
            "Đo lường hiệu suất với Nhật ký giao dịch chi tiết"
          ]}
        />
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center gap-2 p-4 shrink-0">
            <h2 className="text-lg font-bold text-[#1e2329] dark:text-white">Mô phỏng Giao dịch</h2>
            <button className="w-6 h-6 rounded-full bg-[#f0f1f3] dark:bg-[#1e222d] hover:bg-[#e6e8ea] dark:hover:bg-[#2a2e39] flex items-center justify-center text-[#787b86] transition-colors">
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

      {/* Tabs */}
      <div className="flex gap-2 px-4 mb-4 shrink-0">
        <button
          onClick={() => setActiveTab('running')}
          className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors ${
            activeTab === 'running' 
              ? 'bg-[#089981] text-white' 
              : 'bg-[#f0f1f3] dark:bg-[#1e222d] text-[#787b86] hover:text-[#1e2329] dark:hover:text-white'
          }`}
        >
          Đang chạy
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors ${
            activeTab === 'completed' 
              ? 'bg-[#089981] text-white' 
              : 'bg-[#f0f1f3] dark:bg-[#1e222d] text-[#787b86] hover:text-[#1e2329] dark:hover:text-white'
          }`}
        >
          Đã xong
        </button>
      </div>

      {activeTab === 'running' && (
        <div className="flex flex-col px-4 flex-1 overflow-hidden">
          <button 
            onClick={() => {
              if (!isReplaying) {
                setShowReplayWarning(true);
              } else {
                setIsCreating(true);
              }
            }}
            className="w-full bg-[#089981] hover:bg-[#089981]/90 text-white font-bold py-2.5 rounded-md flex items-center justify-center gap-2 transition-colors shrink-0 uppercase text-sm mb-4"
          >
            <Play className="w-4 h-4 fill-white" />
            BẮT ĐẦU PHIÊN MỚI
          </button>
          
          {store.isActive && store.session ? (
            <div className="flex-1 flex flex-col gap-4 pb-4">
              <div className="bg-[#1e222d] border border-[#089981] rounded-lg p-4 shadow-lg shadow-[#089981]/10">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-white text-lg">{store.session.symbol}</span>
                  <span className="text-xs text-[#089981] bg-[#089981]/10 px-2 py-1 rounded font-bold animate-pulse">ĐANG CHẠY</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-[#787b86] mb-1">Tài sản (Equity)</span>
                    <span className="font-mono font-bold text-lg text-white">
                      ${store.session.equity.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-[#787b86] mb-1">Số dư (Balance)</span>
                    <span className="font-mono font-bold text-lg text-[#d1d4dc]">
                      ${store.session.balance.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 bg-[#131722] p-3 rounded border border-[#2a2e39]">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#787b86]">Ký quỹ đã dùng</span>
                    <span className="font-mono text-white">${store.session.usedMargin.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#787b86]">Ký quỹ khả dụng</span>
                    <span className="font-mono text-white">${store.session.freeMargin.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2 pt-2 border-t border-[#2a2e39]">
                    <span className="text-[#787b86]">Mức Ký quỹ</span>
                    <span className={`font-mono font-bold ${
                      store.session.usedMargin > 0 && (store.session.equity / store.session.usedMargin * 100) < 100 
                        ? 'text-red-500' 
                        : 'text-emerald-500'
                    }`}>
                      {store.session.usedMargin > 0 
                        ? ((store.session.equity / store.session.usedMargin) * 100).toFixed(2) + '%'
                        : '∞'
                      }
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => store.endSession()}
                  className="w-full mt-4 bg-transparent border border-red-500/50 hover:bg-red-500/10 text-red-500 font-bold py-2 rounded transition-colors text-sm"
                >
                  KẾT THÚC PHIÊN
                </button>
              </div>
            </div>
          ) : activeSessions.length === 0 ? (
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center justify-center p-6 text-center text-[#787b86]">
              <div className="w-16 h-16 rounded-full bg-[#f0f1f3] dark:bg-[#1e222d] flex items-center justify-center mb-4">
                <Play className="w-8 h-8 text-[#a0a3af] dark:text-[#434651] ml-1" />
              </div>
              <p className="mb-4 text-sm font-medium text-[#1e2329] dark:text-white">Không có phiên giao dịch nào</p>
              <p className="mb-6 text-xs text-[#787b86] max-w-[200px] leading-relaxed">Sử dụng nút ở trên để tạo và định cấu hình phiên mới.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 pb-4">
              {activeSessions.map((session: any) => (
                <div 
                  key={session._id} 
                  className="bg-[#f8f9fa] dark:bg-[#1e222d] border border-[#e6e8ea] dark:border-[#2a2e39] rounded-lg p-3 cursor-pointer hover:border-[#089981] transition-colors"
                  onClick={async () => {
                    try {
                      const { getSessionDetails } = await import('../../../services/marketApi');
                      const data = await getSessionDetails(session._id);
                      
                      store.loadSession(
                        {
                          _id: data.session._id,
                          name: data.session.name,
                          symbol: data.session.symbol,
                          timeframe: data.session.timeframe,
                          config: {
                            initialBalance: data.session.initialBalance,
                            leverage: data.session.leverage,
                            minLot: data.session.minLot,
                            lotStep: data.session.lotStep,
                            maxMarginPercent: data.session.maxMarginPercent,
                            spread: data.session.spread,
                            commission: data.session.commission,
                            swapLong: data.session.swapLong,
                            swapShort: data.session.swapShort
                          },
                          balance: data.session.balance,
                          equity: data.session.equity,
                          usedMargin: data.session.usedMargin,
                          freeMargin: data.session.freeMargin,
                          replayStartTime: data.session.replayStartTime,
                          replayCurrentTime: data.session.replayCurrentTime,
                          status: data.session.status
                        },
                        data.positions,
                        data.orders,
                        data.history
                      );
                    } catch (error) {
                      console.error("Failed to load session", error);
                    }
                  }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-[#1e2329] dark:text-white text-base">{session.symbol}</span>
                    <span className="text-xs text-[#089981] bg-[#089981]/10 px-2 py-0.5 rounded font-bold">Đang chạy</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-mono">
                    <span className="text-[#787b86]">Số dư:</span>
                    <span className="font-bold text-[#1e2329] dark:text-[#d1d4dc]">${session.balance?.toLocaleString() || session.initialBalance?.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

          {activeTab === 'completed' && (
            <div className="flex flex-col px-4 flex-1 overflow-hidden">
              <div className="flex items-center justify-between mb-4 shrink-0">
                <h3 className="font-bold text-[#1e2329] dark:text-white text-base">Lịch sử Phiên</h3>
                <span className="bg-[#f0f1f3] dark:bg-[#1e222d] text-[#1e2329] dark:text-white text-xs font-bold px-2 py-0.5 rounded">{completedSessions.length}</span>
              </div>
              
              <div className="flex gap-2 mb-4 shrink-0">
                {/* Symbol Filter Dropdown */}
                <div className="relative flex-1">
                  <button 
                    onClick={() => { setShowSymbolDropdown(!showSymbolDropdown); setShowDatePicker(false); }}
                    className={`w-full bg-transparent border rounded px-3 py-1.5 text-sm flex items-center justify-between hover:border-[#787b86] transition-colors ${
                      symbolFilter ? 'border-[#2962ff] text-[#2962ff]' : 'border-[#e6e8ea] dark:border-[#2a2e39] text-[#1e2329] dark:text-[#d1d4dc]'
                    }`}
                  >
                    <span className="truncate">{symbolFilter || 'Tất cả mã...'}</span>
                    <ChevronDown className="w-4 h-4 text-[#787b86]" />
                  </button>
                  {showSymbolDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#1e222d] border border-[#2a2e39] rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                      <button 
                        onClick={() => { setSymbolFilter(''); setShowSymbolDropdown(false); }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-[#2a2e39] transition-colors ${
                          !symbolFilter ? 'text-[#2962ff] font-bold' : 'text-[#d1d4dc]'
                        }`}
                      >
                        Tất cả mã
                      </button>
                      {completedSymbols.map(sym => (
                        <button 
                          key={sym}
                          onClick={() => { setSymbolFilter(sym); setShowSymbolDropdown(false); }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-[#2a2e39] transition-colors ${
                            symbolFilter === sym ? 'text-[#2962ff] font-bold' : 'text-[#d1d4dc]'
                          }`}
                        >
                          {sym}
                        </button>
                      ))}
                      {completedSymbols.length === 0 && (
                        <div className="px-3 py-2 text-sm text-[#787b86]">Không có mã nào</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Date Range Filter */}
                <div className="relative flex-1">
                  <button 
                    onClick={() => { setShowDatePicker(!showDatePicker); setShowSymbolDropdown(false); }}
                    className={`w-full bg-transparent border rounded px-3 py-1.5 text-sm flex items-center justify-between hover:border-[#787b86] transition-colors ${
                      (dateFrom || dateTo) ? 'border-[#2962ff] text-[#2962ff]' : 'border-[#e6e8ea] dark:border-[#2a2e39] text-[#1e2329] dark:text-[#d1d4dc]'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <Calendar className="w-4 h-4" />
                      {(dateFrom || dateTo) 
                        ? `${dateFrom ? new Date(dateFrom).toLocaleDateString('vi-VN', {day:'2-digit',month:'2-digit'}) : '...'} - ${dateTo ? new Date(dateTo).toLocaleDateString('vi-VN', {day:'2-digit',month:'2-digit'}) : '...'}`
                        : 'Khoảng ngày'
                      }
                    </span>
                  </button>
                  {showDatePicker && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#1e222d] border border-[#2a2e39] rounded-lg shadow-xl z-50 p-3 space-y-2">
                      <CustomDatePicker 
                        label="Từ ngày"
                        value={dateFrom} 
                        onChange={(val) => setDateFrom(val)}
                        align="right"
                      />
                      <div className="mt-2"></div>
                      <CustomDatePicker 
                        label="Đến ngày"
                        value={dateTo} 
                        onChange={(val) => setDateTo(val)}
                        align="right"
                      />
                      <div className="flex gap-2 pt-1">
                        <button 
                          onClick={() => { setDateFrom(''); setDateTo(''); setShowDatePicker(false); }}
                          className="flex-1 text-xs text-[#787b86] hover:text-[#d1d4dc] py-1.5 rounded border border-[#2a2e39] hover:border-[#787b86] transition-colors"
                        >
                          Xóa lọc
                        </button>
                        <button 
                          onClick={() => setShowDatePicker(false)}
                          className="flex-1 text-xs text-white bg-[#2962ff] hover:bg-[#2962ff]/90 py-1.5 rounded font-medium transition-colors"
                        >
                          Áp dụng
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-[#089981]/10 dark:bg-[#089981]/10 border border-[#089981]/20 rounded-lg p-4 cursor-pointer hover:bg-[#089981]/20 transition-colors shrink-0 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded bg-[#089981] flex items-center justify-center shrink-0">
                    <Edit3 className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 pr-4">
                    <h4 className="font-bold text-[#089981] text-sm mb-1">Mở Nhật ký Giao dịch</h4>
                    <p className="text-xs text-[#787b86] leading-relaxed">Xem lại, gắn thẻ và phân tích các phiên giao dịch</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#089981] shrink-0 mt-1" />
                </div>
              </div>

              {completedSessions.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center pb-10">
                  <p className="font-bold text-[#1e2329] dark:text-white text-base">Chưa có phiên nào hoàn tất</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3">
                  {completedSessions.map(session => (
                    <div key={session._id} className="bg-[#f8f9fa] dark:bg-[#1e222d] border border-[#e6e8ea] dark:border-[#2a2e39] rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-[#1e2329] dark:text-white text-base">{session.symbol}</span>
                        <span className="text-xs text-[#787b86] bg-[#e6e8ea] dark:bg-[#2a2e39] px-2 py-0.5 rounded font-bold">Hoàn tất</span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-mono">
                        <span className="text-[#787b86]">Số dư cuối:</span>
                        <span className="font-bold text-[#1e2329] dark:text-[#d1d4dc]">${session.balance?.toLocaleString() || session.initialBalance?.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Replay Warning Modal */}
      {showReplayWarning && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 px-4 backdrop-blur-sm">
          <div className="bg-[#1e222d] rounded-lg p-5 w-full border border-[#2a2e39] shadow-2xl flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center mb-3">
              <span className="text-yellow-500 text-2xl">⚠️</span>
            </div>
            <h3 className="text-white font-bold mb-2">Hãy bật Chế độ Phát lại trước</h3>
            <p className="text-sm text-[#787b86] mb-5">
              Trading Simulator chỉ hoạt động trong chế độ Bar Replay để tránh việc nhìn thấy dữ liệu tương lai.
              <br/><br/>
              Vui lòng bật Replay trên thanh công cụ phía trên và chọn một điểm bắt đầu.
            </p>
            <button 
              onClick={() => setShowReplayWarning(false)}
              className="w-full bg-[#2962ff] hover:bg-[#2962ff]/90 text-white font-bold py-2 rounded transition-colors"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
