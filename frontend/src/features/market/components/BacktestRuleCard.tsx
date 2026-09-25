import { useState, useRef, useEffect } from 'react';
import { X, Square, ChevronDown, ChevronUp, CheckCircle2, Circle } from 'lucide-react';

interface BacktestRules {
  strategy: string;
  symbol: string;
  timeframe: string;
  entryRule: string;
  stopLossRule: string;
  takeProfitRule: string;
  invalidationRule?: string;
}

interface BacktestRuleCardProps {
  rules: BacktestRules;
  replayTime?: number | null;
  onStop: () => void;
  onDismiss: () => void;
}

/** Parse numbered list text like "1. foo\n2. bar" into array of strings */
function parseSteps(text: string): string[] {
  return text
    .split('\n')
    .map(s => s.replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean);
}

export const BacktestRuleCard = ({ rules, replayTime, onStop, onDismiss }: BacktestRuleCardProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());

  // ── Drag state ──
  const [pos, setPos] = useState({ x: 12, y: -1 }); // -1 = not initialised
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  // Place card bottom-right on first render
  useEffect(() => {
    if (pos.y === -1) {
      setPos({ x: window.innerWidth - 296, y: window.innerHeight - 480 });
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    dragOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
    e.preventDefault();
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const nx = e.clientX - dragOffset.current.x;
      const ny = e.clientY - dragOffset.current.y;
      const w = cardRef.current?.offsetWidth || 280;
      const h = cardRef.current?.offsetHeight || 400;
      setPos({
        x: Math.max(0, Math.min(nx, window.innerWidth - w)),
        y: Math.max(0, Math.min(ny, window.innerHeight - h)),
      });
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  const entrySteps = parseSteps(rules.entryRule);
  const allChecked = checkedSteps.size === entrySteps.length;

  const toggleStep = (i: number) => {
    setCheckedSteps(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const formatTime = (ts?: number | null) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
      + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  if (pos.y === -1) return null; // wait for position init

  return (
    <div
      ref={cardRef}
      className="fixed z-50 w-[280px] rounded-xl shadow-2xl border border-slate-700/60 overflow-hidden"
      style={{
        left: pos.x,
        top: pos.y,
        background: 'linear-gradient(145deg, #0f1624 0%, #141d2e 100%)',
        userSelect: 'none',
      }}
    >
      {/* ── Drag Handle Header ── */}
      <div
        className="flex items-center justify-between px-3 py-2 cursor-grab active:cursor-grabbing border-b border-slate-700/40"
        style={{ background: 'rgba(251,146,60,0.08)' }}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse shrink-0" />
          <span className="text-[11px] font-bold text-orange-300 truncate max-w-[130px]" title={rules.strategy}>
            {rules.strategy}
          </span>
          {replayTime && (
            <span className="text-[9px] font-mono text-slate-500 shrink-0">
              {formatTime(replayTime)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setCollapsed(c => !c)}
            className="p-0.5 text-slate-400 hover:text-white transition-colors rounded"
            title={collapsed ? 'Mở rộng' : 'Thu gọn'}
          >
            {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onDismiss}
            className="p-0.5 text-slate-500 hover:text-slate-300 transition-colors rounded"
            title="Ẩn bảng"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="p-3 space-y-2.5 text-[11px]">

          {/* ── Entry Checklist ── */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-bold text-amber-300">Điều Kiện Vào Lệnh</span>
              <span className={`ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded ${allChecked ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'}`}>
                {checkedSteps.size}/{entrySteps.length}
              </span>
            </div>
            <div className="space-y-1">
              {entrySteps.map((step, i) => (
                <button
                  key={i}
                  onClick={() => toggleStep(i)}
                  className={`w-full text-left flex items-start gap-2 px-2 py-1.5 rounded-lg transition-all ${
                    checkedSteps.has(i)
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                      : 'bg-slate-800/60 border border-slate-700/40 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                  }`}
                >
                  {checkedSteps.has(i)
                    ? <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                    : <Circle className="w-3 h-3 text-slate-600 shrink-0 mt-0.5" />
                  }
                  <span className="leading-relaxed">{step}</span>
                </button>
              ))}
            </div>
            {allChecked && (
              <div className="mt-1.5 text-center text-[10px] font-bold text-emerald-400 bg-emerald-500/10 rounded py-1 border border-emerald-500/20">
                ✅ Đủ điều kiện — Có thể vào lệnh!
              </div>
            )}
          </div>

          {/* ── SL / TP ── */}
          <div className="grid grid-cols-2 gap-1.5">
            <div className="p-2 rounded-lg bg-red-950/40 border border-red-500/20">
              <div className="font-bold text-red-400 text-[10px] mb-1 flex items-center gap-1">
                <span>🛑</span> Stop Loss
              </div>
              <div className="text-red-200/70 leading-relaxed text-[10px]">
                {rules.stopLossRule}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/20">
              <div className="font-bold text-emerald-400 text-[10px] mb-1 flex items-center gap-1">
                <span>🎯</span> Take Profit
              </div>
              <div className="text-emerald-200/70 leading-relaxed text-[10px]">
                {rules.takeProfitRule}
              </div>
            </div>
          </div>

          {/* ── Invalidation ── */}
          {rules.invalidationRule && (
            <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-600/30">
              <div className="font-bold text-slate-400 text-[10px] mb-0.5">❌ Hủy setup nếu:</div>
              <div className="text-slate-500 text-[10px] leading-relaxed">{rules.invalidationRule}</div>
            </div>
          )}

          {/* ── Stop Button ── */}
          <button
            onClick={onStop}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold text-[11px] transition-all shadow cursor-pointer"
          >
            <Square className="w-3 h-3" fill="currentColor" />
            Thoát Backtest
          </button>
        </div>
      )}
    </div>
  );
};
