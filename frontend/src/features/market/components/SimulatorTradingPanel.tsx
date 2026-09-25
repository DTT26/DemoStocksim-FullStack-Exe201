import { useState, useEffect } from 'react';
import { type Stock, getPricePrecision } from '../data';
import { useSimulatorStore } from '../engine/useSimulatorStore';
import { ArrowUp, ArrowDown, Wallet, ChevronLeft } from 'lucide-react';

interface SimulatorTradingPanelProps {
  selectedStock: Stock;
  onBack?: () => void;
  onPreviewTPSLChange?: (tpsl: { tp?: number; sl?: number; side?: 'LONG' | 'SHORT'; enabled: boolean; orderPrice?: number; orderType?: 'LIMIT' | 'STOP' } | null) => void;
  draggedTPSL?: { tp?: number; sl?: number; orderPrice?: number } | null;
}

export const SimulatorTradingPanel = ({ 
  selectedStock, 
  onBack,
  onPreviewTPSLChange,
  draggedTPSL
}: SimulatorTradingPanelProps) => {
  const store = useSimulatorStore();
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT' | 'STOP'>('MARKET');
  const [lot, setLot] = useState<number>(store.session?.config.minLot || 0.1);
  const [priceStr, setPriceStr] = useState<string>('');
  const [showTPSL, setShowTPSL] = useState<boolean>(false);
  const [sl, setSl] = useState<string>('');
  const [tp, setTp] = useState<string>('');
  const [setupTag, setSetupTag] = useState<string>('');
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  if (!store.isActive || !store.session) return null;

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const { config } = store.session;
  const leverageInfo = selectedStock.leverageInfo || { max: 20, marks: [5, 10, 15, 20] };
  const leverage = config.leverage || 1;
  const setLev = (val: number) => {
    store.setLeverage(val);
  };
  
  // Calculate dynamic properties
  const effectivePrice = store.currentPrice > 0 ? store.currentPrice : selectedStock.price;
  const spreadValue = config.spread > 0 ? config.spread : 0.2;
  const currentExecBid = store.currentBid > 0 ? store.currentBid : effectivePrice;
  const currentExecAsk = store.currentAsk > 0 ? store.currentAsk : (effectivePrice + spreadValue);

  const priceNum = parseFloat(priceStr) || effectivePrice;
  const actualQty = lot * 100000;
  
  const marginRequired = orderType === 'MARKET' 
    ? (currentExecAsk * actualQty) / leverage 
    : (priceNum * actualQty) / leverage;

  const maxAllowedMargin = (store.session.equity * config.maxMarginPercent) / 100;
  const freeMarginAvailable = Math.max(0, maxAllowedMargin - store.session.usedMargin);
  const isMarginExceeded = marginRequired > freeMarginAvailable;

  // Listen for real-time drag updates from chart
  useEffect(() => {
    if (draggedTPSL) {
      if (draggedTPSL.tp !== undefined) {
        setTp(draggedTPSL.tp.toString());
      }
      if (draggedTPSL.sl !== undefined) {
        setSl(draggedTPSL.sl.toString());
      }
      if (draggedTPSL.orderPrice !== undefined && orderType !== 'MARKET') {
        setPriceStr(draggedTPSL.orderPrice.toString());
      }
    }
  }, [draggedTPSL, orderType]);

  // Synchronize preview TP/SL and order price line with parent chart
  useEffect(() => {
    const activePos = store.positions.find(p => p.symbol?.toUpperCase() === selectedStock.symbol?.toUpperCase());
    const currentSide = activePos ? activePos.side : 'LONG';

    if (orderType !== 'MARKET') {
      onPreviewTPSLChange?.({
        tp: showTPSL && tp ? parseFloat(tp) : undefined,
        sl: showTPSL && sl ? parseFloat(sl) : undefined,
        side: currentSide,
        enabled: true,
        orderPrice: priceNum,
        orderType: orderType,
      });
    } else if (showTPSL && (tp || sl)) {
      onPreviewTPSLChange?.({
        tp: tp ? parseFloat(tp) : undefined,
        sl: sl ? parseFloat(sl) : undefined,
        side: currentSide,
        enabled: true,
      });
    } else {
      onPreviewTPSLChange?.(null);
    }
  }, [showTPSL, tp, sl, orderType, priceStr, priceNum, selectedStock.symbol, onPreviewTPSLChange]);

  // Clear preview when unmounting
  useEffect(() => {
    return () => {
      onPreviewTPSLChange?.(null);
    };
  }, [onPreviewTPSLChange]);

  const handleTrade = (side: 'LONG' | 'SHORT') => {
    if (isMarginExceeded) {
      showToast('Vượt quá Ký quỹ tối đa cho phép!', false);
      return;
    }
    if (lot <= 0) {
      showToast('Khối lượng Lot phải lớn hơn 0!', false);
      return;
    }

    const slVal = sl ? parseFloat(sl) : undefined;
    const tpVal = tp ? parseFloat(tp) : undefined;

    const execPrice = orderType === 'MARKET'
      ? (side === 'LONG' ? currentExecAsk : currentExecBid)
      : priceNum;

    if (tpVal !== undefined) {
      if (side === 'LONG' && tpVal <= execPrice) {
        showToast('Chốt lời (TP) của lệnh LONG phải CAO HƠN giá mở lệnh!', false);
        return;
      }
      if (side === 'SHORT' && tpVal >= execPrice) {
        showToast('Chốt lời (TP) của lệnh SHORT phải THẤP HƠN giá mở lệnh!', false);
        return;
      }
    }
    if (slVal !== undefined) {
      if (side === 'LONG' && slVal >= execPrice) {
        showToast('Cắt lỗ (SL) của lệnh LONG phải THẤP HƠN giá mở lệnh!', false);
        return;
      }
      if (side === 'SHORT' && slVal <= execPrice) {
        showToast('Cắt lỗ (SL) của lệnh SHORT phải CAO HƠN giá mở lệnh!', false);
        return;
      }
    }

    if (orderType === 'MARKET') {
      store.executeMarketOrder(
        side, 
        lot, 
        slVal, 
        tpVal, 
        setupTag || undefined
      );
      showToast(`Đã mở lệnh ${side} ${lot} lot thành công!`, true);
    } else {
      if (priceNum <= 0) {
        showToast('Giá đặt lệnh không hợp lệ!', false);
        return;
      }
      store.placePendingOrder(
        orderType, 
        side, 
        priceNum, 
        lot, 
        slVal, 
        tpVal, 
        setupTag || undefined
      );
      showToast(`Đã đặt lệnh chờ ${side} ${orderType} thành công!`, true);
    }
    setSetupTag('');
  };

  return (
    <div className="w-full bg-white dark:bg-[#131722] flex flex-col h-full overflow-hidden text-[#1e2329] dark:text-[#d1d4dc] font-sans">
      {/* Header */}
      <div className="p-3 border-b border-[#e6e8ea] dark:border-[#2a2e39] shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-1 hover:bg-[#e6e8ea] dark:hover:bg-[#1e222d] rounded text-[#787b86] hover:text-[#1e2329] dark:hover:text-white transition-colors"
              title="Quay lại danh sách phiên"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="text-xs font-bold text-[#1e2329] dark:text-white uppercase tracking-wider">Mô phỏng Giao dịch</div>
            <div className="text-[11px] text-[#787b86]">
              {selectedStock.symbol} &middot; Đòn bẩy {leverage}X
            </div>
          </div>
        </div>
        <span className="text-[10px] bg-blue-500/10 text-blue-500 font-bold px-2 py-0.5 rounded border border-blue-500/20">
          SIMULATOR
        </span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col gap-3">
        {/* Balance row */}
        <div className="flex items-center justify-between text-xs pb-1 border-b border-[#e6e8ea] dark:border-[#2a2e39]/50">
          <div className="flex items-center gap-1.5 text-[#787b86]">
            <Wallet className="w-3.5 h-3.5" />
            <span>Balance</span>
          </div>
          <span className="font-mono text-[#089981] font-bold">
            {store.session.balance.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} ₫
          </span>
        </div>

        {/* Order Type Tabs */}
        <div className="flex bg-[#f0f1f3] dark:bg-[#1e222d] rounded p-1 shrink-0 gap-1 text-xs font-semibold">
          {(['MARKET', 'LIMIT', 'STOP'] as const).map(type => (
            <button
              key={type}
              onClick={() => setOrderType(type)}
              className={`flex-1 py-1.5 rounded uppercase transition-colors text-center text-[11px] ${
                orderType === type 
                  ? 'bg-blue-600 text-white font-bold' 
                  : 'text-[#787b86] hover:text-[#1e2329] dark:hover:text-[#d1d4dc]'
              }`}
            >
              {type === 'MARKET' ? 'Thị trường' : type}
            </button>
          ))}
        </div>

        {/* Price & Qty inputs */}
        <div className="flex gap-2">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-[10px] text-[#787b86] uppercase tracking-wider font-semibold">
              {orderType === 'MARKET' ? 'Giá (Thị trường)' : 'Giá đặt (VND)'}
            </label>
            {orderType === 'MARKET' ? (
              <div className="bg-[#f0f1f3] dark:bg-[#1e222d] border border-[#e6e8ea] dark:border-[#2a2e39] rounded px-3 py-1.5 text-sm text-[#787b86] font-mono cursor-not-allowed">
                {effectivePrice.toLocaleString('vi-VN')}
              </div>
            ) : (
              <input
                type="number"
                value={priceStr}
                placeholder={effectivePrice.toString()}
                onChange={e => setPriceStr(e.target.value)}
                className="bg-[#f0f1f3] dark:bg-[#1e222d] border border-[#e6e8ea] dark:border-[#2a2e39] rounded px-3 py-1.5 text-sm text-[#1e2329] dark:text-white font-mono focus:outline-none focus:border-blue-500 transition-colors w-full"
              />
            )}
          </div>

          <div className="flex flex-col gap-1 flex-1">
            <label className="text-[10px] text-[#787b86] uppercase tracking-wider font-semibold">Khối lượng (Lot)</label>
            <div className="flex items-center">
              <button 
                onClick={() => setLot(l => Math.max(config.minLot, parseFloat((l - config.lotStep).toFixed(2))))}
                className="bg-[#f0f1f3] dark:bg-[#1e222d] border border-[#e6e8ea] dark:border-[#2a2e39] border-r-0 px-2.5 py-1.5 rounded-l text-[#1e2329] dark:text-white hover:bg-[#e6e8ea] dark:hover:bg-[#2a2e39] text-xs font-bold"
              >
                -
              </button>
              <input
                type="number"
                value={lot}
                step={config.lotStep}
                min={config.minLot}
                onChange={e => setLot(parseFloat(e.target.value) || 0)}
                className="flex-1 w-0 bg-transparent border-y border-[#e6e8ea] dark:border-[#2a2e39] focus:border-blue-500 py-1.5 text-sm text-center text-[#1e2329] dark:text-white font-mono outline-none"
              />
              <button 
                onClick={() => setLot(l => parseFloat((l + config.lotStep).toFixed(2)))}
                className="bg-[#f0f1f3] dark:bg-[#1e222d] border border-[#e6e8ea] dark:border-[#2a2e39] border-l-0 px-2.5 py-1.5 rounded-r text-[#1e2329] dark:text-white hover:bg-[#e6e8ea] dark:hover:bg-[#2a2e39] text-xs font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Custom Leverage Slider Inline */}
        <div className="flex flex-col gap-1 mt-1">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] text-[#787b86] uppercase tracking-wider font-semibold">Đòn bẩy</label>
            <span className="text-xs font-mono font-bold text-[#1e2329] dark:text-white">{leverage}X</span>
          </div>

          <div className="relative mt-2 mb-5 mx-1">
            <input
              type="range"
              min="1"
              max={leverageInfo.max}
              value={leverage}
              onChange={e => setLev(parseInt(e.target.value))}
              className="w-full h-[3px] appearance-none cursor-pointer relative z-10 bg-transparent custom-leverage-slider m-0 p-0 block"
              style={{
                background: `linear-gradient(to right, var(--lev-fill) ${(((leverage) - 1) / (leverageInfo.max - 1)) * 100}%, var(--lev-bg) ${(((leverage) - 1) / (leverageInfo.max - 1)) * 100}%)`
              }}
            />

            {/* Markers layer */}
            <div className="absolute top-[1.5px] left-[7px] right-[7px] pointer-events-none z-20">
              {/* Base 1x */}
              <div
                className="absolute top-0 -translate-y-[14px] -translate-x-1/2 flex flex-col items-center justify-start cursor-pointer pointer-events-auto group w-[30px] h-[40px]"
                style={{ left: '0%' }}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLev(1); }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-[#1e2329] dark:bg-white transition-transform group-hover:scale-125 shrink-0 mt-[10px]" />
                <span className="text-[10px] font-semibold text-[#1e2329] dark:text-white whitespace-nowrap mt-1">1X</span>
              </div>

              {leverageInfo.marks.map(m => {
                const percent = ((m - 1) / (leverageInfo.max - 1)) * 100;
                const isActive = leverage >= m;
                return (
                  <div
                    key={m}
                    className="absolute top-0 -translate-y-[14px] -translate-x-1/2 flex flex-col items-center justify-start cursor-pointer pointer-events-auto group w-[40px] h-[40px]"
                    style={{ left: `${percent}%` }}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLev(m); }}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full transition-transform group-hover:scale-125 shrink-0 mt-[10px] ${isActive ? 'bg-[#1e2329] dark:bg-white' : 'bg-[#e6e8ea] dark:bg-[#2a2e39]'}`} />
                    <span className={`text-[10px] font-semibold whitespace-nowrap mt-1 transition-colors ${isActive ? 'text-[#1e2329] dark:text-[#d1d4dc] group-hover:text-black dark:group-hover:text-white' : 'text-[#787b86] group-hover:text-[#1e2329] dark:group-hover:text-white'}`}>
                      {m}X
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* TP / SL Toggle */}
        <div className="flex items-center gap-2 pt-2 border-t border-[#e6e8ea] dark:border-[#2a2e39]/50">
          <input
            type="checkbox"
            id="sim-toggle-tpsl"
            checked={showTPSL}
            onChange={(e) => {
              const isChecked = e.target.checked;
              setShowTPSL(isChecked);
              if (isChecked) {
                const activePos = store.positions.find(p => p.symbol === selectedStock.symbol);
                const refPrice = orderType !== 'MARKET' && parseFloat(priceStr) > 0
                  ? parseFloat(priceStr)
                  : (activePos && activePos.entryPrice > 0 ? activePos.entryPrice : effectivePrice);
                const precision = getPricePrecision(refPrice);
                const currentSide = activePos ? activePos.side : 'LONG';

                let newTp = tp;
                let newSl = sl;
                if (!newTp) {
                  const tpFactor = currentSide === 'LONG' ? 1.05 : 0.95;
                  newTp = (refPrice * tpFactor).toFixed(precision);
                  setTp(newTp);
                }
                if (!newSl) {
                  const slFactor = currentSide === 'LONG' ? 0.97 : 1.03;
                  newSl = (refPrice * slFactor).toFixed(precision);
                  setSl(newSl);
                }
              } else {
                setTp('');
                setSl('');
              }
            }}
            className="w-3.5 h-3.5 accent-blue-600 cursor-pointer"
          />
          <label htmlFor="sim-toggle-tpsl" className="text-xs text-[#787b86] cursor-pointer hover:text-[#1e2329] dark:hover:text-[#d1d4dc] transition-colors">
            Thiết lập Chốt lời / Cắt lỗ (TP/SL)
          </label>
        </div>

        {/* TP / SL inputs */}
        {showTPSL && (() => {
          const activePos = store.positions.find(p => p.symbol === selectedStock.symbol);
          const baseRefPrice = (orderType !== 'MARKET' && parseFloat(priceStr) > 0)
            ? parseFloat(priceStr)
            : (activePos && activePos.entryPrice > 0 ? activePos.entryPrice : effectivePrice);
          const sliderPrecision = getPricePrecision(baseRefPrice);
          const sliderStep = baseRefPrice > 1000 ? '1' : baseRefPrice > 10 ? '0.1' : Math.pow(10, -sliderPrecision).toString();

          return (
            <div className="flex gap-2 border-t border-[#e6e8ea] dark:border-[#2a2e39]/50 pt-2 mt-1">
              <div className="flex flex-col gap-1 flex-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-[#089981] uppercase tracking-wider font-semibold">Chốt lời (TP)</label>
                </div>
                <input
                  type="number"
                  value={tp}
                  placeholder="Tùy chọn"
                  onChange={e => setTp(e.target.value)}
                  className="bg-white dark:bg-[#1e222d] border border-[#e6e8ea] dark:border-[#2a2e39] rounded px-3 py-1.5 text-sm text-[#1e2329] dark:text-white font-mono focus:outline-none focus:border-[#089981] transition-colors w-full placeholder:text-[#787b86] dark:placeholder:text-[#434651]"
                />
                <input
                  type="range"
                  min={(baseRefPrice * 0.5).toFixed(sliderPrecision)}
                  max={(baseRefPrice * 1.5).toFixed(sliderPrecision)}
                  step={sliderStep}
                  value={tp || baseRefPrice}
                  onChange={e => setTp(e.target.value)}
                  className="w-full accent-[#089981] mt-1 h-1 bg-[#e6e8ea] dark:bg-[#2a2e39] rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-[#f23645] uppercase tracking-wider font-semibold">Cắt lỗ (SL)</label>
                </div>
                <input
                  type="number"
                  value={sl}
                  placeholder="Tùy chọn"
                  onChange={e => setSl(e.target.value)}
                  className="bg-white dark:bg-[#1e222d] border border-[#e6e8ea] dark:border-[#2a2e39] rounded px-3 py-1.5 text-sm text-[#1e2329] dark:text-white font-mono focus:outline-none focus:border-[#f23645] transition-colors w-full placeholder:text-[#787b86] dark:placeholder:text-[#434651]"
                />
                <input
                  type="range"
                  min={(baseRefPrice * 0.5).toFixed(sliderPrecision)}
                  max={(baseRefPrice * 1.5).toFixed(sliderPrecision)}
                  step={sliderStep}
                  value={sl || baseRefPrice}
                  onChange={e => setSl(e.target.value)}
                  className="w-full accent-[#f23645] mt-1 h-1 bg-[#e6e8ea] dark:bg-[#2a2e39] rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          );
        })()}

        {/* Setup Tag (Journal) */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-[#787b86] uppercase tracking-wider font-semibold">Nhãn Setup (Nhật ký)</label>
          <input
            type="text"
            value={setupTag}
            onChange={e => setSetupTag(e.target.value)}
            placeholder="Vd: Breakout, Pinbar, MA Cross..."
            className="bg-[#f0f1f3] dark:bg-[#1e222d] border border-[#e6e8ea] dark:border-[#2a2e39] focus:border-blue-500 rounded px-3 py-1.5 text-xs text-[#1e2329] dark:text-white outline-none placeholder:text-[#787b86]"
          />
        </div>

        {/* Risk / Margin Details */}
        <div className="bg-[#f8f9fa] dark:bg-[#151924] rounded border border-[#e6e8ea] dark:border-[#1e222d] p-2.5 flex flex-col gap-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#787b86]">Ký quỹ yêu cầu</span>
            <span className="font-mono text-[#1e2329] dark:text-white font-bold">
              {marginRequired.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} ₫
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#787b86]">Khối lượng thực tế</span>
            <span className="font-mono text-[#787b86]">{actualQty.toLocaleString('vi-VN')}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#787b86]">Spread Mua/Bán</span>
            <span className="font-mono text-[#787b86]">
              {currentExecBid.toLocaleString('vi-VN')} / {currentExecAsk.toLocaleString('vi-VN')}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] border-t border-[#e6e8ea] dark:border-[#2a2e39] pt-1.5 mt-0.5">
            <span className="text-[#787b86]">Ký quỹ khả dụng</span>
            <span className="font-mono text-[#787b86]">
              {freeMarginAvailable.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} ₫
            </span>
          </div>
          {isMarginExceeded && (
            <div className="text-[11px] text-red-500 font-bold mt-1 text-center bg-red-500/10 py-1 rounded">
              Vượt quá Ký quỹ tối đa cho phép
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons LONG / SHORT */}
      <div className="p-3 border-t border-[#e6e8ea] dark:border-[#2a2e39] flex flex-col gap-2 shrink-0 bg-white dark:bg-[#131722]">
        <div className="flex gap-2">
          <button
            disabled={isMarginExceeded}
            onClick={() => handleTrade('LONG')}
            className="flex-1 bg-[#089981] hover:bg-[#089981]/85 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded text-sm transition-all flex flex-col items-center justify-center gap-0.5"
          >
            <div className="flex items-center gap-1"><ArrowUp className="w-3.5 h-3.5" /> LONG</div>
            <span className="text-[10px] font-mono opacity-90">{currentExecAsk.toLocaleString('vi-VN')}</span>
          </button>
          <button
            disabled={isMarginExceeded}
            onClick={() => handleTrade('SHORT')}
            className="flex-1 bg-[#f23645] hover:bg-[#f23645]/85 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded text-sm transition-all flex flex-col items-center justify-center gap-0.5"
          >
            <div className="flex items-center gap-1"><ArrowDown className="w-3.5 h-3.5" /> SHORT</div>
            <span className="text-[10px] font-mono opacity-90">{currentExecBid.toLocaleString('vi-VN')}</span>
          </button>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`text-xs px-3 py-1.5 rounded text-center font-medium transition-all ${
            toast.ok ? 'bg-green-900/50 text-green-300 border border-green-700' : 'bg-red-900/50 text-red-300 border border-red-700'
          }`}>
            {toast.msg}
          </div>
        )}
      </div>
    </div>
  );
};
