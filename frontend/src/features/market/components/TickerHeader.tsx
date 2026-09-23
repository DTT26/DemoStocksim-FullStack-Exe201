import { useState } from 'react';
import { Search, BarChart2, Play, Pause, Square, ChevronRight, CandlestickChart, Settings, RefreshCcw, Undo2, Redo2 } from 'lucide-react';
import { TIMEFRAMES, getPricePrecision, type Stock } from '../data';
import { AssetAvatar } from './AssetAvatar';

interface TickerHeaderProps {
  stock: Stock;
  activeTab: 'chart' | 'coin_info' | 'info';
  onTabChange: (tab: 'chart' | 'coin_info' | 'info') => void;
  activeTimeframe: string;
  onTimeframeChange: (t: string) => void;
  isReplaying: boolean;
  isSelectingReplayStart: boolean;
  replayTime?: number | null;
  totalBars?: number;
  isChallengeActive?: boolean;
  onStartReplay: () => void;
  onCancelReplay: () => void;
  onReplayNext: () => void;
  onStopReplay: () => void;
  onGoToRealtime: () => void;
  onOpenSearch: () => void;
  onOpenIndicator: () => void;
  activeIndicatorCount: number;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

export const TickerHeader = ({ 
  stock, activeTab, onTabChange, activeTimeframe, onTimeframeChange, isReplaying, isSelectingReplayStart, replayTime, totalBars = 1000,
  isChallengeActive = false,
  onStartReplay, onCancelReplay, onReplayNext, onStopReplay, onGoToRealtime, onOpenSearch, onOpenIndicator, activeIndicatorCount,
  canUndo = false, canRedo = false, onUndo, onRedo
}: TickerHeaderProps) => {
  const [autoPlay, setAutoPlay] = useState(false);
  const [intervalId, setIntervalId] = useState<ReturnType<typeof setInterval> | null>(null);

  const startAutoPlay = () => {
    setAutoPlay(true);
    const id = setInterval(() => onReplayNext(), 600);
    setIntervalId(id);
  };

  const stopAutoPlay = () => {
    setAutoPlay(false);
    if (intervalId) clearInterval(intervalId);
    setIntervalId(null);
  };

  const handleStopReplay = () => {
    stopAutoPlay();
    onStopReplay();
  };

  const reachedEnd = replayTime ? replayTime >= Date.now() - 60000 : false;

  const formatReplayTime = (timestamp?: number | null) => {
    if (!timestamp) return '';
    const d = new Date(timestamp);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const precision = getPricePrecision(stock.price);
  const markPrice = (stock.price * 1.0002).toFixed(precision);
  const indexPrice = (stock.price * 1.0001).toFixed(precision);
  const high24h = stock.price * 1.022;
  const low24h = stock.price * 0.978;
  const vol24h = stock.price > 1000 ? 158.49 : 15849.2;
  const volUSDT = stock.price > 1000 ? 396.55 : 39.65;
  const isUp = stock.type === 'up';

  return (
    <div className="flex flex-col bg-white dark:bg-[#131722] border-b border-[#e6e8ea] dark:border-[#2a2e39] text-xs shrink-0 w-full transition-colors">
      
      {/* ─── Row 1: Ticker Info ─── */}
      <div className="flex items-center px-4 py-2 overflow-x-auto hide-scrollbar">
        <div 
          onClick={onOpenSearch}
          className="flex items-center gap-4 pr-6 border-r border-[#e6e8ea] dark:border-[#2a2e39] shrink-0 cursor-pointer hover:bg-[#f5f5f5] dark:hover:bg-[#2a2e39]/50 rounded p-1 -ml-1 transition-colors group"
        >
          <div className="flex items-center gap-2">
            <AssetAvatar stock={stock} size="md" showExchangeBadge={false} />
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-xl font-bold text-[#1e2329] dark:text-[#d1d4dc] group-hover:text-blue-500 dark:group-hover:text-blue-400">{stock.symbol}</span>
              </div>
              <span className="text-[#787b86] text-[11px] underline decoration-dashed underline-offset-2">
                {stock.name}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end pl-4">
            <span className={`text-lg font-bold font-mono leading-tight ${isUp ? 'text-[#089981]' : 'text-[#f23645]'}`}>
              {stock.price.toLocaleString('vi-VN', { minimumFractionDigits: Math.min(2, precision), maximumFractionDigits: precision })}
            </span>
            <span className={`font-mono text-[11px] ${isUp ? 'text-[#089981]' : 'text-[#f23645]'}`}>
              {stock.change > 0 ? '+' : ''}{stock.change.toFixed(precision)} ({stock.percent > 0 ? '+' : ''}{stock.percent.toFixed(2)}%)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-8 pl-6 shrink-0 whitespace-nowrap">
          {stock.market === 'Tiền điện tử (Crypto)' && (
            <>
              <div className="flex flex-col gap-0.5">
                <span className="text-[#787b86] text-xs">Giá đánh dấu</span>
                <span className="text-[#1e2329] dark:text-[#d1d4dc] font-mono font-semibold text-sm">{markPrice}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[#787b86] text-xs">Giá chỉ số</span>
                <span className="text-[#1e2329] dark:text-[#d1d4dc] font-mono font-semibold text-sm">{indexPrice}</span>
              </div>
              {stock.isFutures && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-[#787b86] text-xs">Tài trợ (8h)/Quyết toán</span>
                  <span className="text-[#f6a111] font-mono font-semibold text-sm">0.0100% / 00:44:27</span>
                </div>
              )}
            </>
          )}
          <div className="flex flex-col gap-0.5">
            <span className="text-[#787b86] text-xs">Cao nhất 24 giờ</span>
            <span className="text-[#1e2329] dark:text-[#d1d4dc] font-mono font-semibold text-sm">{high24h.toLocaleString('vi-VN', { minimumFractionDigits: Math.min(2, precision), maximumFractionDigits: precision })}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[#787b86] text-xs">Thấp nhất 24 giờ</span>
            <span className="text-[#1e2329] dark:text-[#d1d4dc] font-mono font-semibold text-sm">{low24h.toLocaleString('vi-VN', { minimumFractionDigits: Math.min(2, precision), maximumFractionDigits: precision })}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[#787b86] text-xs">KL 24h ({stock.symbol.replace('USDT', '').replace('.P', '')})</span>
            <span className="text-[#1e2329] dark:text-[#d1d4dc] font-mono font-semibold text-sm">{vol24h.toFixed(2)}K</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[#787b86] text-xs">KL 24h (USDT)</span>
            <span className="text-[#1e2329] dark:text-[#d1d4dc] font-mono font-semibold text-sm">{volUSDT.toFixed(2)}M</span>
          </div>
        </div>
      </div>

      {/* ─── Row 2: Tabs & Tools ─── */}
      <div className="flex items-center px-4 justify-between border-t border-b border-[#e6e8ea] dark:border-[#2a2e39] bg-[#f8f9fa] dark:bg-[#1e222d]">
        
        {/* Left Side: Tabs */}
        <div className="flex items-center gap-6 text-[13px] font-medium text-[#787b86] pt-1.5">
          <button 
            onClick={() => onTabChange('chart')}
            className={`pb-1.5 border-b-2 ${activeTab === 'chart' ? 'text-[#1e2329] dark:text-[#d1d4dc] border-blue-500' : 'border-transparent hover:text-[#1e2329] dark:hover:text-[#d1d4dc]'}`}
          >
            Biểu đồ
          </button>
          <button 
            onClick={() => onTabChange('coin_info')}
            className={`pb-1.5 border-b-2 ${activeTab === 'coin_info' ? 'text-[#1e2329] dark:text-[#d1d4dc] border-blue-500' : 'border-transparent hover:text-[#1e2329] dark:hover:text-[#d1d4dc]'}`}
          >
            Thông Tin {stock.market === 'Tiền điện tử (Crypto)' ? 'Coin' : 'Cổ phiếu'}
          </button>
          <button 
            onClick={() => onTabChange('info')}
            className={`pb-1.5 border-b-2 ${activeTab === 'info' ? 'text-[#1e2329] dark:text-[#d1d4dc] border-blue-500' : 'border-transparent hover:text-[#1e2329] dark:hover:text-[#d1d4dc]'}`}
          >
            Thông tin
          </button>
        </div>

        {/* Right Side: Tools */}
        <div className="flex items-center gap-3 text-[#787b86] text-xs py-1">
          <span className="hidden sm:inline">Khoảng thời gian</span>
          <div className="flex items-center gap-0.5">
            {TIMEFRAMES.map(tf => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
                  activeTimeframe === tf ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'hover:text-[#1e2329] dark:hover:text-[#d1d4dc] hover:bg-[#e6e8ea] dark:hover:bg-[#2a2e39]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
          
          <div className="w-px h-4 bg-[#e6e8ea] dark:bg-[#2a2e39] mx-1" />

          <button className="hover:bg-[#e6e8ea] dark:hover:bg-[#2a2e39] p-1 rounded transition-colors text-blue-600 dark:text-blue-500" title="Biểu đồ nến">
            <CandlestickChart className="w-4 h-4" />
          </button>

          <button 
            onClick={onOpenIndicator}
            className="flex items-center gap-1 hover:bg-[#e6e8ea] dark:hover:bg-[#2a2e39] px-2 py-1 rounded transition-colors relative"
          >
            <BarChart2 className="w-4 h-4" />
            {activeIndicatorCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold">
                {activeIndicatorCount}
              </span>
            )}
          </button>

          <div className="w-px h-4 bg-[#e6e8ea] dark:bg-[#2a2e39] mx-1" />

          {isSelectingReplayStart ? (
            <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-700/60 rounded px-2 py-0.5 shrink-0">
              <span className="text-blue-700 dark:text-blue-300 text-xs font-semibold">
                Nhấp vào nến trên biểu đồ để chọn điểm bắt đầu
              </span>
              <button 
                onClick={onCancelReplay}
                className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-2 py-0.5 rounded text-gray-800 dark:text-gray-200 transition-colors"
              >
                Hủy
              </button>
            </div>
          ) : isChallengeActive ? (
            <button
              disabled
              title="Bài thi cấp vốn yêu cầu 100% dữ liệu thời gian thực (Real-time) để đảm bảo tính minh bạch, không được dùng Replay."
              className="flex items-center gap-1.5 px-2 py-1 rounded text-slate-400 opacity-40 cursor-not-allowed border border-dashed border-slate-600/40"
            >
              <Play className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs">Replay (Khóa khi thi)</span>
            </button>
          ) : !isReplaying ? (
            <button
              onClick={onStartReplay}
              className="flex items-center gap-1 hover:bg-[#e6e8ea] dark:hover:bg-[#2a2e39] px-2 py-1 rounded transition-colors"
            >
              <Play className="w-4 h-4" />
              <span className="hidden sm:inline">Replay</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 bg-orange-100 dark:bg-orange-900/40 border border-orange-300 dark:border-orange-700/60 rounded px-2 py-0.5 shrink-0">
              <span className="text-orange-700 dark:text-orange-300 text-xs font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse inline-block" />
                <span>{reachedEnd ? '✅ Đã đến hiện tại' : 'Replay'}</span>
                {replayTime && (
                  <span className="font-mono text-[11px] bg-orange-200 dark:bg-orange-800/70 text-orange-900 dark:text-orange-200 px-1.5 py-0.5 rounded font-semibold">
                    {formatReplayTime(replayTime)}
                  </span>
                )}
              </span>
              {!reachedEnd && !autoPlay && (
                <button onClick={onReplayNext} title="Nến tiếp theo (Bước tiếp)" className="p-1 text-orange-600 dark:text-orange-200 hover:bg-orange-200 dark:hover:bg-orange-700/40 rounded transition-colors">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
              {!reachedEnd && (
                <button onClick={autoPlay ? stopAutoPlay : startAutoPlay} title={autoPlay ? "Tạm dừng" : "Phát tự động"} className="p-1 text-orange-600 dark:text-orange-200 hover:bg-orange-200 dark:hover:bg-orange-700/40 rounded transition-colors">
                  {autoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
              )}
              <button onClick={handleStopReplay} title="Thoát chế độ Replay" className="p-1 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 rounded transition-colors">
                <Square className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="w-px h-4 bg-[#e6e8ea] dark:bg-[#2a2e39] mx-1 hidden sm:block" />

          {/* Undo & Redo (Quay lại & Làm lại) */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              title="Hoàn tác (Ctrl+Z)"
              className="p-1 rounded transition-colors text-[#787b86] hover:text-[#1e2329] dark:hover:text-[#d1d4dc] hover:bg-[#e6e8ea] dark:hover:bg-[#2a2e39] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              title="Làm lại (Ctrl+Y)"
              className="p-1 rounded transition-colors text-[#787b86] hover:text-[#1e2329] dark:hover:text-[#d1d4dc] hover:bg-[#e6e8ea] dark:hover:bg-[#2a2e39] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="w-px h-4 bg-[#e6e8ea] dark:bg-[#2a2e39] mx-1 hidden sm:block" />
          
          <button 
            onClick={onGoToRealtime}
            title="Đến biểu đồ thời gian thực"
            className="hover:bg-[#e6e8ea] dark:hover:bg-[#2a2e39] p-1 rounded transition-colors hidden sm:block"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
          
          <button className="hover:bg-[#e6e8ea] dark:hover:bg-[#2a2e39] p-1 rounded transition-colors hidden sm:block"><Settings className="w-4 h-4" /></button>
        </div>
      </div>

    </div>
  );
};
