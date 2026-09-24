import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Wallet, ChevronRight, ChevronLeft, Settings2 } from 'lucide-react';
import { STOCKS, type Stock, generateOHLCV, getPricePrecision } from '../data';
import { useAuth } from '../../../contexts/AuthContext';
import { useModal } from '../../../contexts/ModalContext';
import { OrderBook } from './OrderBook';

interface RightSidebarProps {
  selectedStock: Stock;
  positions: Record<string, { quantity: number, averagePrice: number, side: 'LONG' | 'SHORT', leverage: number, tp?: number, sl?: number }>;
  balance: number;
  onStockSelect: (stock: Stock) => void;
  onTrade: (type: 'buy' | 'sell' | 'close' | 'limit_buy' | 'limit_sell' | 'stop_buy' | 'stop_sell', price: number, margin: number, leverage: number, tp?: number, sl?: number) => Promise<{ success: boolean; message: string }>;
  onUpdateTPSL: (symbol: string, side: 'LONG' | 'SHORT', tp?: number, sl?: number) => Promise<{ success: boolean; message: string }>;
  onAddMargin?: (symbol: string, side: 'LONG' | 'SHORT', amount: number) => Promise<{ success: boolean; message: string }>;
  isEditing?: boolean;
  onCancelEdit?: () => void;
  onPreviewTPSLChange?: (tpsl: { tp?: number; sl?: number; side?: 'LONG' | 'SHORT'; enabled: boolean } | null) => void;
  draggedTPSL?: { tp?: number; sl?: number } | null;
}

export const RightSidebar = ({ selectedStock, positions, balance, onStockSelect, onTrade, onUpdateTPSL, onAddMargin, isEditing, onCancelEdit, onPreviewTPSLChange, draggedTPSL }: RightSidebarProps) => {
  const { user, login } = useAuth();
  const { showAlert } = useModal();
  const [activeSidebarTab, setActiveSidebarTab] = useState<'orderbook' | 'trade'>('trade');
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop'>('market');
  const [isExpanded, setIsExpanded] = useState(true);
  const [limitPriceStr, setLimitPriceStr] = useState<string>('');
  const [lotStr, setLotStr] = useState<string>('0.1');
  const [leverage, setLev] = useState<number>(10);
  const [tp, setTp] = useState<string>('');
  const [sl, setSl] = useState<string>('');
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTPSL, setShowTPSL] = useState(false);

  // Force showTPSL when editing
  useEffect(() => {
    if (isEditing) {
      setShowTPSL(true);
    }
  }, [isEditing]);

  // Bỏ sync price vì chỉ dùng Market Price
  useEffect(() => {
    // Pre-fill TP/SL from active position if it exists
    const pos = positions[selectedStock.symbol];
    if (pos) {
      setTp(pos.tp ? pos.tp.toString() : '');
      setSl(pos.sl ? pos.sl.toString() : '');
    } else {
      setTp('');
      setSl('');
      setShowTPSL(false);
    }
  }, [selectedStock.symbol, positions]);

  // Listen for real-time drag updates from chart
  useEffect(() => {
    if (draggedTPSL) {
      if (draggedTPSL.tp !== undefined) {
        setTp(draggedTPSL.tp.toString());
      }
      if (draggedTPSL.sl !== undefined) {
        setSl(draggedTPSL.sl.toString());
      }
    }
  }, [draggedTPSL]);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdateTPSL = async () => {
    if (!side) return;
    const tpVal = tp ? parseFloat(tp) : undefined;
    const slVal = sl ? parseFloat(sl) : undefined;
    if (isSubmitting) return;
    setIsSubmitting(true);
    const res = await onUpdateTPSL(selectedStock.symbol, side, tpVal, slVal);
    showToast(res.message, res.success);
    setIsSubmitting(false);
    if (res.success && onCancelEdit) onCancelEdit();
  };

  const handleTrade = async (type: 'buy' | 'sell' | 'close') => {
    // Nếu là Market order thì dùng selectedStock.price, Limit thì dùng limitPriceStr
    const p = (orderType !== 'market' && type !== 'close') ? parseFloat(limitPriceStr) || 0 : selectedStock.price;

    const lot = parseFloat(lotStr) || 0;
    const actualQty = lot * 100000;
    const requiredMargin = (actualQty * p) / leverage;

    const m = type === 'close' ? 1 : requiredMargin;
    const tpVal = tp ? parseFloat(tp) : undefined;
    const slVal = sl ? parseFloat(sl) : undefined;

    if (type === 'close') {
      const result = await onTrade('close', p, m, leverage, tpVal, slVal);
      showToast(result.message, result.success);
      return;
    }

    // Validation
    if (orderType === 'limit') {
      if (p <= 0) return showAlert({ title: 'Giá không hợp lệ', message: 'Giá Limit không hợp lệ', type: 'warning' });
      if (type === 'buy' && p >= selectedStock.price) {
        return showAlert({ title: 'Giá Limit không hợp lệ', message: `Giá mua Limit (${p}) phải THẤP HƠN giá thị trường hiện tại (${selectedStock.price})`, type: 'warning' });
      }
      if (type === 'sell' && p <= selectedStock.price) {
        return showAlert({ title: 'Giá Limit không hợp lệ', message: `Giá bán Limit (${p}) phải CAO HƠN giá thị trường hiện tại (${selectedStock.price})`, type: 'warning' });
      }
    } else if (orderType === 'stop') {
      if (p <= 0) return showAlert({ title: 'Giá không hợp lệ', message: 'Giá Stop không hợp lệ', type: 'warning' });
      if (type === 'buy' && p <= selectedStock.price) {
        return showAlert({ title: 'Giá Stop không hợp lệ', message: `Giá mua Stop (${p}) phải CAO HƠN giá thị trường hiện tại (${selectedStock.price})`, type: 'warning' });
      }
      if (type === 'sell' && p >= selectedStock.price) {
        return showAlert({ title: 'Giá Stop không hợp lệ', message: `Giá bán Stop (${p}) phải THẤP HƠN giá thị trường hiện tại (${selectedStock.price})`, type: 'warning' });
      }
    }

    if (tpVal !== undefined) {
      if (type === 'buy' && tpVal <= p) return showAlert({ title: 'Thiết lập TP/SL', message: 'Chốt lời (TP) của lệnh LONG phải CAO HƠN giá mở lệnh', type: 'warning' });
      if (type === 'sell' && tpVal >= p) return showAlert({ title: 'Thiết lập TP/SL', message: 'Chốt lời (TP) của lệnh SHORT phải THẤP HƠN giá mở lệnh', type: 'warning' });
    }
    if (slVal !== undefined) {
      if (type === 'buy' && slVal >= p) return showAlert({ title: 'Thiết lập TP/SL', message: 'Cắt lỗ (SL) của lệnh LONG phải THẤP HƠN giá mở lệnh', type: 'warning' });
      if (type === 'sell' && slVal <= p) return showAlert({ title: 'Thiết lập TP/SL', message: 'Cắt lỗ (SL) của lệnh SHORT phải CAO HƠN giá mở lệnh', type: 'warning' });
    }

    if (m <= 0) {
      showAlert({ title: 'Khối lượng không hợp lệ', message: 'Khối lượng Lot phải lớn hơn 0!', type: 'warning' });
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    const tradeType = orderType === 'market' ? type :
      orderType === 'limit' ? (type === 'buy' ? 'limit_buy' : 'limit_sell') :
        (type === 'buy' ? 'stop_buy' : 'stop_sell');
    const result = await onTrade(tradeType, p, requiredMargin, leverage, tpVal, slVal);
    showToast(result.message, result.success);
    setIsSubmitting(false);
  };

  const pTotal = orderType === 'limit' ? (parseFloat(limitPriceStr) || 0) : selectedStock.price;
  const currentLot = parseFloat(lotStr) || 0;
  const actualQty = currentLot * 100000;
  const requiredMargin = (actualQty * pTotal) / leverage;

  const held = positions[selectedStock.symbol]?.quantity || 0;
  const avgPrice = positions[selectedStock.symbol]?.averagePrice || 0;
  const side = positions[selectedStock.symbol]?.side;
  const posLeverage = positions[selectedStock.symbol]?.leverage || 1;
  const posTp = positions[selectedStock.symbol]?.tp;
  const posSl = positions[selectedStock.symbol]?.sl;

  const leverageInfo = selectedStock.leverageInfo || { max: 20, marks: [5, 10, 15, 20] }; // Fallback

  let pnl = 0;
  let pnlPercent = 0;
  if (held > 0 && avgPrice > 0) {
    if (side === 'LONG') {
      pnl = (selectedStock.price - avgPrice) * held;
    } else {
      pnl = (avgPrice - selectedStock.price) * held;
    }
    const actualMargin = (avgPrice * held) / posLeverage;
    pnlPercent = (pnl / actualMargin) * 100; // ROE
  }
  const pnlColor = pnl >= 0 ? 'text-[#089981]' : 'text-[#f23645]';
  const pnlSign = pnl >= 0 ? '+' : '';

  // Synchronize preview TP/SL with parent chart
  useEffect(() => {
    if (showTPSL) {
      const currentSide = held > 0 && side ? side : 'LONG';
      const tpNum = tp ? parseFloat(tp) : undefined;
      const slNum = sl ? parseFloat(sl) : undefined;
      onPreviewTPSLChange?.({
        enabled: true,
        tp: (tpNum !== undefined && !isNaN(tpNum)) ? tpNum : undefined,
        sl: (slNum !== undefined && !isNaN(slNum)) ? slNum : undefined,
        side: currentSide
      });
    } else {
      onPreviewTPSLChange?.(null);
    }
  }, [showTPSL, tp, sl, side, held, onPreviewTPSLChange]);

  if (!isExpanded) {
    return (
      <div className="w-10 flex flex-col bg-[#131722] flex-1 min-h-0 overflow-hidden items-center">
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full py-4 flex items-center justify-center text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d] transition-colors"
          title="Mở bảng đặt lệnh"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 border-r border-[#2a2e39] w-0"></div>
      </div>
    );
  }

  return (
    <div className="w-[280px] flex flex-col bg-white dark:bg-[#131722] border-l border-[#e6e8ea] dark:border-[#2a2e39] flex-1 min-h-0 overflow-hidden text-[#1e2329] dark:text-[#d1d4dc]">
      {/* Header Tabs Sổ lệnh / Giao dịch */}
      <div className="flex items-center border-b border-[#e6e8ea] dark:border-[#2a2e39] shrink-0">
        <button
          onClick={() => setIsExpanded(false)}
          className="p-3 text-[#787b86] hover:text-[#1e2329] dark:hover:text-[#d1d4dc] hover:bg-[#f0f3fa] dark:hover:bg-[#1e222d] transition-colors border-r border-[#e6e8ea] dark:border-[#2a2e39]"
          title="Thu gọn"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <div className="flex-1 flex items-center">
          <button
            onClick={() => setActiveSidebarTab('orderbook')}
            className={`flex-1 py-3 text-xs font-semibold transition-colors ${activeSidebarTab === 'orderbook' ? 'text-blue-600 dark:text-white border-b-2 border-blue-500' : 'text-[#787b86] hover:text-[#1e2329] dark:hover:text-[#d1d4dc]'}`}
          >
            Sổ lệnh
          </button>
          <button
            onClick={() => setActiveSidebarTab('trade')}
            className={`flex-1 py-3 text-xs font-semibold transition-colors ${activeSidebarTab === 'trade' ? 'text-blue-600 dark:text-white border-b-2 border-blue-500' : 'text-[#787b86] hover:text-[#1e2329] dark:hover:text-[#d1d4dc]'}`}
          >
            Giao dịch
          </button>
        </div>
        <button className="p-3 text-[#787b86] hover:text-[#1e2329] dark:hover:text-[#d1d4dc] hover:bg-[#f0f3fa] dark:hover:bg-[#1e222d] transition-colors">
          <Settings2 className="w-4 h-4" />
        </button>
      </div>

      {activeSidebarTab === 'orderbook' ? (
        <div className="flex-1 overflow-y-auto min-h-0">
          <OrderBook symbol={selectedStock.symbol} currentPrice={selectedStock.price} isUp={selectedStock.type === 'up'} />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="flex items-center px-2 py-2 border-b border-[#e6e8ea] dark:border-[#2a2e39] text-[10px] uppercase tracking-wider text-[#787b86] font-semibold">
            <div className="flex-1 ml-1">Symbol</div>
            <div className="w-20 text-right">Price</div>
            <div className="w-14 text-right">Chg%</div>
          </div>

          {STOCKS.map(stock => (
            <div
              key={stock.symbol}
              onClick={() => { onStockSelect(stock); }}
              className={`flex items-center px-3 py-2 text-xs cursor-pointer transition-colors border-b border-[#e6e8ea] dark:border-[#2a2e39]/40 ${selectedStock.symbol === stock.symbol
                ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-l-blue-500'
                : 'hover:bg-[#f0f3fa] dark:hover:bg-[#1e222d]'
                }`}
            >
              <div className="flex-1 flex flex-col">
                <span className="text-[#1e2329] dark:text-[#d1d4dc] font-semibold">{stock.symbol}</span>
                <span className="text-[#787b86] text-[10px]">{stock.name}</span>
              </div>
              <div className={`w-20 text-right font-mono font-semibold ${stock.type === 'up' ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                {stock.price >= 100 ? stock.price.toLocaleString('vi-VN') : stock.price.toFixed(getPricePrecision(stock.price))}
              </div>
              <div className={`w-14 text-right flex items-center justify-end gap-0.5 ${stock.type === 'up' ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                {stock.type === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{Math.abs(stock.percent).toFixed(2)}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Entry */}
      {user ? (
        <div className="border-t border-[#e6e8ea] dark:border-[#2a2e39] p-3 flex flex-col gap-2.5 shrink-0 bg-[#f8f9fa] dark:bg-[#131722]">
          {/* Balance row */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-[#787b86]">
              <Wallet className="w-3 h-3" />
              <span>Balance</span>
            </div>
            <span className="font-mono text-green-600 dark:text-green-400 font-semibold">${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          {/* Order type */}
          <div className="flex gap-1.5 text-xs font-semibold pb-1">
            <button
              onClick={() => { if (!isEditing) setOrderType('market'); }}
              className={`flex-1 py-1.5 rounded uppercase transition-colors ${orderType === 'market'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#f0f3fa] dark:bg-[#1e222d] text-[#787b86] ' + (isEditing ? 'opacity-50 cursor-not-allowed' : 'hover:text-[#1e2329] dark:hover:text-[#d1d4dc]')
                }`}
            >
              Thị trường
            </button>
            <button
              onClick={() => { if (!isEditing) setOrderType('limit'); }}
              className={`flex-1 py-1.5 rounded uppercase transition-colors ${orderType === 'limit'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#f0f3fa] dark:bg-[#1e222d] text-[#787b86] ' + (isEditing ? 'opacity-50 cursor-not-allowed' : 'hover:text-[#1e2329] dark:hover:text-[#d1d4dc]')
                }`}
            >
              Limit
            </button>
            <button
              onClick={() => { if (!isEditing) setOrderType('stop'); }}
              className={`flex-1 py-1.5 rounded uppercase transition-colors ${orderType === 'stop'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#f0f3fa] dark:bg-[#1e222d] text-[#787b86] ' + (isEditing ? 'opacity-50 cursor-not-allowed' : 'hover:text-[#1e2329] dark:hover:text-[#d1d4dc]')
                }`}
            >
              Stop
            </button>
          </div>

          {/* Price & Qty inputs */}
          <div className="flex gap-2">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-[10px] text-[#787b86] uppercase tracking-wider">
                {isEditing ? 'Giá vào lệnh' : `Giá ${orderType === 'market' ? '(Thị trường)' : '(USD)'}`}
              </label>
              {isEditing ? (
                <div className="bg-[#f0f3fa] dark:bg-[#1e222d] border border-[#e6e8ea] dark:border-[#2a2e39] rounded px-3 py-1.5 text-sm text-[#787b86] font-mono cursor-not-allowed">
                  {avgPrice >= 100 ? avgPrice.toLocaleString('en-US') : avgPrice.toFixed(getPricePrecision(avgPrice))}
                </div>
              ) : orderType === 'market' ? (
                <div className="bg-[#f0f3fa] dark:bg-[#1e222d] border border-[#e6e8ea] dark:border-[#2a2e39] rounded px-3 py-1.5 text-sm text-[#787b86] font-mono cursor-not-allowed">
                  {selectedStock.price >= 100 ? selectedStock.price.toLocaleString('en-US') : selectedStock.price.toFixed(getPricePrecision(selectedStock.price))}
                </div>
              ) : (
                <input
                  type="number"
                  disabled={isEditing}
                  value={limitPriceStr}
                  placeholder="VD: 64500"
                  onChange={e => setLimitPriceStr(e.target.value)}
                  className="bg-white dark:bg-[#1e222d] border border-[#e6e8ea] dark:border-[#2a2e39] rounded px-3 py-1.5 text-sm text-[#1e2329] dark:text-white font-mono focus:outline-none focus:border-blue-500 transition-colors w-full disabled:opacity-50"
                />
              )}
            </div>

            <div className="flex flex-col gap-1 flex-1">
              <label className="text-[10px] text-[#787b86] uppercase tracking-wider">Khối lượng (Lot)</label>
              {isEditing ? (
                <div className="bg-[#f0f3fa] dark:bg-[#1e222d] border border-[#e6e8ea] dark:border-[#2a2e39] rounded px-3 py-1.5 text-sm text-[#787b86] font-mono cursor-not-allowed">
                  {(held / 100000).toLocaleString('vi-VN')}
                </div>
              ) : (
                <input
                  type="number"
                  step="0.01"
                  value={lotStr}
                  onChange={e => setLotStr(e.target.value)}
                  className="bg-white dark:bg-[#1e222d] border border-[#e6e8ea] dark:border-[#2a2e39] rounded px-3 py-1.5 text-sm text-[#1e2329] dark:text-white font-mono focus:outline-none focus:border-blue-500 transition-colors w-full"
                />
              )}
            </div>
          </div>

          {/* Custom Leverage Slider Inline */}
          <div className={`flex flex-col gap-1 mt-1 ${isEditing ? 'opacity-50' : ''}`}>
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] text-[#787b86] uppercase tracking-wider">Đòn bẩy</label>
              <span className="text-xs font-mono font-bold text-[#1e2329] dark:text-white">{isEditing ? posLeverage : leverage}X</span>
            </div>

            <div className="relative mt-2 mb-5 mx-1">
              <input
                type="range"
                min="1"
                max={leverageInfo.max}
                value={isEditing ? posLeverage : leverage}
                disabled={isEditing}
                onChange={e => setLev(parseInt(e.target.value))}
                className="w-full h-[3px] appearance-none cursor-pointer relative z-10 bg-transparent custom-leverage-slider m-0 p-0 block disabled:cursor-not-allowed"
                style={{
                  background: `linear-gradient(to right, var(--lev-fill) ${(((isEditing ? posLeverage : leverage) - 1) / (leverageInfo.max - 1)) * 100}%, var(--lev-bg) ${(((isEditing ? posLeverage : leverage) - 1) / (leverageInfo.max - 1)) * 100}%)`
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
          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="toggle-tpsl"
              checked={showTPSL}
              disabled={isEditing}
              onChange={(e) => {
                const isChecked = e.target.checked;
                setShowTPSL(isChecked);
                if (isChecked) {
                  const refPrice = orderType === 'limit' && parseFloat(limitPriceStr) > 0 
                    ? parseFloat(limitPriceStr) 
                    : (held > 0 && avgPrice > 0 ? avgPrice : selectedStock.price);
                  const precision = getPricePrecision(refPrice);
                  const currentSide = held > 0 && side ? side : 'LONG';

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
            <label htmlFor="toggle-tpsl" className="text-xs text-[#787b86] cursor-pointer hover:text-[#1e2329] dark:hover:text-[#d1d4dc] transition-colors">
              Thiết lập Chốt lời / Cắt lỗ (TP/SL)
            </label>
          </div>

          {/* TP / SL inputs */}
          {showTPSL && (() => {
            const baseRefPrice = held > 0 && avgPrice > 0 ? avgPrice : (orderType === 'limit' && parseFloat(limitPriceStr) > 0 ? parseFloat(limitPriceStr) : selectedStock.price);
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

          {/* Total info */}
          <div className="flex items-center justify-between text-xs pt-2">
            <span className="text-[#787b86]">Ký quỹ yêu cầu</span>
            <span className="font-mono text-[#1e2329] dark:text-[#d1d4dc] font-bold">${requiredMargin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex items-center justify-between text-[10px] pb-2">
            <span className="text-[#787b86]">Khối lượng thực tế</span>
            <span className="font-mono text-[#787b86]">{actualQty.toLocaleString('vi-VN')}</span>
          </div>

          {/* Buttons */}
          {isEditing ? (
            <div className="flex gap-2">
              <button
                onClick={onCancelEdit}
                disabled={isSubmitting}
                className="flex-1 bg-[#2a2e39] hover:bg-[#363a45] text-white font-bold py-2.5 rounded text-sm transition-all"
              >
                HỦY SỬA
              </button>
              <button
                onClick={handleUpdateTPSL}
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold py-2.5 rounded text-sm transition-all"
              >
                LƯU CẬP NHẬT
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => handleTrade('buy')}
                disabled={isSubmitting}
                className="flex-1 bg-[#089981] hover:bg-[#089981]/80 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded text-sm transition-all"
              >
                LONG
              </button>
              <button
                onClick={() => handleTrade('sell')}
                disabled={isSubmitting}
                className="flex-1 bg-[#f23645] hover:bg-[#f23645]/80 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded text-sm transition-all"
              >
                SHORT
              </button>
            </div>
          )}

          {/* Toast notification */}
          {toast && (
            <div className={`text-xs px-3 py-2 rounded text-center font-medium transition-all ${toast.ok ? 'bg-green-900/50 text-green-300 border border-green-700' : 'bg-red-900/50 text-red-300 border border-red-700'
              }`}>
              {toast.msg}
            </div>
          )}
        </div>
      ) : (
        <div className="border-t border-[#2a2e39] p-6 flex flex-col items-center justify-center text-center gap-4 shrink-0 bg-[#131722]">
          <Wallet className="w-8 h-8 text-[#434651]" />
          <p className="text-[#787b86] text-xs">Vui lòng đăng nhập để xem số dư và thực hiện giao dịch.</p>
          <button
            onClick={() => login()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded transition-colors"
          >
            Đăng nhập
          </button>
        </div>
      )}
    </div>
  );
};
