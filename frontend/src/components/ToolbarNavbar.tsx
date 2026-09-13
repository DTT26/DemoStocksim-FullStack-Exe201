import { useState } from 'react';
import { Search, Settings, BarChart2, Play, Pause, SkipForward, Square, ChevronRight } from 'lucide-react';
import type { Stock } from '../features/market/data';
import { TIMEFRAMES } from '../features/market/data';
import { AssetAvatar, ExchangeBadge } from '../features/market/components/AssetAvatar';

const TOTAL_BARS = 300;
const DEFAULT_REPLAY_START = 50; // show first 50 bars, then advance

interface ToolbarNavbarProps {
  selectedStock: Stock;
  activeTimeframe: string;
  onTimeframeChange: (tf: string) => void;
  balance: number;
  isReplaying: boolean;
  replayIndex: number;
  onStartReplay: (fromIndex: number) => void;
  onReplayNext: () => void;
  onStopReplay: () => void;
  onOpenSearch: () => void;
  onOpenIndicator: () => void;
  activeIndicatorCount: number;
}

export const ToolbarNavbar = ({
  selectedStock, activeTimeframe, onTimeframeChange, balance,
  isReplaying, replayIndex, onStartReplay, onReplayNext, onStopReplay, onOpenSearch,
  onOpenIndicator, activeIndicatorCount
}: ToolbarNavbarProps) => {
  const [autoPlay, setAutoPlay] = useState(false);
  const [intervalId, setIntervalId] = useState<ReturnType<typeof setInterval> | null>(null);

  const startAutoPlay = () => {
    setAutoPlay(true);
    const id = setInterval(() => {
      onReplayNext();
    }, 600);
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

  const reachedEnd = replayIndex >= TOTAL_BARS;

  return (
    <nav className="h-12 bg-[#131722] border-b border-[#2a2e39] flex items-center px-3 gap-2 text-[#d1d4dc] text-sm shrink-0">

      {/* Logo AITRADEX */}
      <div className="flex items-center shrink-0 pr-2 border-r border-[#2a2e39] mr-1">
        <img src="/images/logo.jpg" alt="AITRADEX" className="h-7 object-contain rounded" />
      </div>

      {/* Symbol Search Trigger */}
      <div 
        onClick={onOpenSearch}
        className="flex items-center gap-2 hover:bg-[#2a2e39] px-2 py-1 rounded cursor-pointer transition-colors shrink-0 group"
        title="Tìm kiếm mã giao dịch"
      >
        <AssetAvatar stock={selectedStock} size="sm" showExchangeBadge={false} />
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors leading-tight">
              {selectedStock.symbol}
            </span>
            <ExchangeBadge exchange={selectedStock.exchange} size="sm" />
          </div>
        </div>
        <Search className="w-3 h-3 text-[#787b86] group-hover:text-blue-400 transition-colors ml-0.5" />
      </div>

      {/* Live price */}
      <div className={`text-sm font-bold font-mono shrink-0 ${selectedStock.type === 'up' ? 'text-[#089981]' : 'text-[#f23645]'}`}>
        {selectedStock.price.toLocaleString('vi-VN')}
        <span className="text-xs ml-1.5 opacity-80">
          {selectedStock.percent > 0 ? '+' : ''}{selectedStock.percent.toFixed(2)}%
        </span>
      </div>

      <div className="w-px h-6 bg-[#2a2e39] shrink-0 mx-1" />

      {/* Timeframes */}
      <div className="flex items-center gap-0.5 overflow-x-auto">
        {TIMEFRAMES.map(tf => (
          <button
            key={tf}
            onClick={() => onTimeframeChange(tf)}
            className={`px-2 py-1 rounded transition-colors text-xs whitespace-nowrap ${
              activeTimeframe === tf
                ? 'text-blue-400 bg-blue-900/30 font-semibold'
                : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#2a2e39]'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-[#2a2e39] shrink-0 mx-1" />

      {/* Indicators */}
      <button
        onClick={onOpenIndicator}
        className="flex items-center gap-1 hover:bg-[#2a2e39] px-2 py-1 rounded transition-colors text-xs shrink-0 relative"
      >
        <BarChart2 className="w-3.5 h-3.5 text-blue-500" />
        <span className="hidden md:block">Chỉ báo</span>
        {activeIndicatorCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
            {activeIndicatorCount}
          </span>
        )}
      </button>

      <div className="w-px h-6 bg-[#2a2e39] shrink-0 mx-1" />

      {/* ─── Bar Replay Controls ─── */}
      {!isReplaying ? (
        <button
          onClick={() => onStartReplay(DEFAULT_REPLAY_START)}
          className="flex items-center gap-1.5 bg-orange-700/80 hover:bg-orange-600 text-orange-100 text-xs px-3 py-1.5 rounded font-semibold transition-colors shrink-0"
        >
          <Play className="w-3.5 h-3.5" />
          Bar Replay
        </button>
      ) : (
        <div className="flex items-center gap-1.5 bg-orange-900/40 border border-orange-700/60 rounded px-2 py-1 shrink-0">
          <span className="text-orange-300 text-xs font-semibold mr-1">
            {reachedEnd ? '✅ Kết thúc' : `Bar ${replayIndex}`}
          </span>

          {/* Step forward */}
          {!reachedEnd && !autoPlay && (
            <button
              onClick={onReplayNext}
              title="Tiến 1 cây nến"
              className="p-1 text-orange-200 hover:bg-orange-700/40 rounded transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {/* Auto play / pause */}
          {!reachedEnd && (
            <button
              onClick={autoPlay ? stopAutoPlay : startAutoPlay}
              title={autoPlay ? 'Tạm dừng' : 'Tự động chạy'}
              className="p-1 text-orange-200 hover:bg-orange-700/40 rounded transition-colors"
            >
              {autoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          )}

          {/* Stop replay */}
          <button
            onClick={handleStopReplay}
            title="Kết thúc Replay"
            className="p-1 text-red-300 hover:bg-red-900/40 rounded transition-colors"
          >
            <Square className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Balance */}
      <div className="hidden lg:flex items-center gap-1.5 bg-[#1e222d] border border-[#2a2e39] px-3 py-1 rounded text-xs shrink-0">
        <span className="text-[#787b86]">Số dư:</span>
        <span className="text-green-400 font-mono font-semibold">{balance.toLocaleString('vi-VN')} ₫</span>
      </div>

      <button className="hover:bg-[#2a2e39] p-1.5 rounded transition-colors shrink-0">
        <Settings className="w-4 h-4" />
      </button>
    </nav>
  );
};
