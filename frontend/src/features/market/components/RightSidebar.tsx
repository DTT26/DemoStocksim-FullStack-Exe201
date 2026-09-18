import { useState, useEffect, useRef, useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { STOCKS, type Stock } from '../data';
import { useAuth } from '../../../contexts/AuthContext';
import { OrderBook } from './OrderBook';

interface RightSidebarProps {
  selectedStock: Stock;
  positions: Record<string, { quantity: number, averagePrice: number, side: 'LONG' | 'SHORT', leverage: number, tp?: number, sl?: number }>;
  balance: number;
  onStockSelect: (stock: Stock) => void;
  onTrade: (type: 'buy' | 'sell' | 'close', price: number, margin: number, leverage: number, tp?: number, sl?: number) => Promise<{ success: boolean; message: string }>;
  onUpdateTPSL: (tp?: number, sl?: number) => Promise<{ success: boolean; message: string }>;
  onAddMargin?: (amount: number) => Promise<{ success: boolean; message: string }>;
}

export const RightSidebar = ({ selectedStock, positions, balance, onStockSelect, onTrade, onUpdateTPSL, onAddMargin }: RightSidebarProps) => {
  const { user, login } = useAuth();
  const [lotStr, setLotStr] = useState<string>('0.1');
  const [leverage, setLev] = useState<number>(10);
  const [tp, setTp] = useState<string>('');
  const [sl, setSl] = useState<string>('');
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  // Pre-fill TP/SL from active position if it exists
  useEffect(() => {
    const pos = positions[selectedStock.symbol];
    if (pos) {
      setTp(pos.tp ? pos.tp.toString() : '');
      setSl(pos.sl ? pos.sl.toString() : '');
    } else {
      setTp('');
      setSl('');
    }
  }, [selectedStock.symbol, positions]);

  // Dynamic leverage info based on selected stock data
  const leverageInfo = useMemo(() => {
    if (selectedStock.leverageInfo) {
      return selectedStock.leverageInfo;
    }
    // Fallback if data is missing
    const exchange = selectedStock.exchange?.toUpperCase() || '';
    if (exchange === 'BINANCE' || selectedStock.market === 'Tiền điện tử (Crypto)') {
      return { max: 125, marks: [25, 50, 75, 100, 125] };
    }
    if (exchange === 'HOSE' || selectedStock.market === 'Cổ phiếu') {
      return { max: 20, marks: [5, 10, 15, 20] };
    }
    return { max: 100, marks: [25, 50, 75, 100] };
  }, [selectedStock]);

  // Ensure current leverage doesn't exceed new max when switching stocks
  useEffect(() => {
    if (leverage > leverageInfo.max) {
      setLev(leverageInfo.max);
    }
  }, [leverageInfo.max, leverage]);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const handleTrade = async (type: 'buy' | 'sell' | 'close') => {
    const p = selectedStock.price;
    const lot = parseFloat(lotStr) || 0;
    const actualQty = lot * 100000;
    const requiredMargin = (actualQty * p) / leverage;

    const m = type === 'close' ? 1 : requiredMargin;
    const tpVal = tp ? parseFloat(tp) : undefined;
    const slVal = sl ? parseFloat(sl) : undefined;

    if (type !== 'close' && m <= 0) {
      showToast('Khối lượng Lot phải lớn hơn 0!', false);
      return;
    }

    const result = await onTrade(type, p, m, leverage, tpVal, slVal);
    showToast(result.message, result.success);
  };

  const pTotal = selectedStock.price;
  const currentLot = parseFloat(lotStr) || 0;
  const actualQty = currentLot * 100000;
  const requiredMargin = (actualQty * pTotal) / leverage;

  const pos = positions[selectedStock.symbol];
  const held = pos?.quantity || 0;
  const avgPrice = pos?.averagePrice || 0;
  const side = pos?.side;
  const posLeverage = pos?.leverage || 1;

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

  return (
    <div className="w-[280px] border-l border-[#e6e8ea] dark:border-[#2a2e39] flex flex-col bg-white dark:bg-[#131722] shrink-0 overflow-hidden transition-colors">
      
      {/* OrderBook Section */}
      <OrderBook 
        symbol={selectedStock.symbol} 
        currentPrice={selectedStock.price} 
        isUp={selectedStock.type === 'up'} 
      />

      {/* Order Entry */}
      {user ? (
        <div className="border-t border-[#e6e8ea] dark:border-[#2a2e39] p-3 flex flex-col gap-2.5 shrink-0 bg-[#f8f9fa] dark:bg-[#131722] transition-colors">
          {/* Balance row */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-[#787b86]">
              <Wallet className="w-3 h-3" />
              <span>Balance</span>
            </div>
            <span className="font-mono text-green-600 dark:text-green-400 font-semibold">{balance.toLocaleString('vi-VN')} ₫</span>
          </div>

          {/* Holding & PnL */}
          <div className="flex flex-col gap-1.5 p-2 bg-white dark:bg-[#1e222d]/50 rounded border border-[#e6e8ea] dark:border-[#2a2e39]/50 shadow-sm">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#787b86]">Vị thế đang mở</span>
              {held > 0 ? (
                <span className={`font-mono font-bold ${side === 'LONG' ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                  {side} x{posLeverage}
                </span>
              ) : (
                <span className="font-mono text-[#1e2329] dark:text-[#d1d4dc] font-semibold">0</span>
              )}
            </div>
            {held > 0 && (
              <>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-[#787b86]">Khối lượng (Size)</span>
                  <span className="font-mono text-[#1e2329] dark:text-[#d1d4dc]">{held.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-[#787b86]">Giá vào lệnh (Entry)</span>
                  <span className="font-mono text-[#1e2329] dark:text-[#d1d4dc]">{avgPrice.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-semibold border-t border-[#e6e8ea] dark:border-[#2a2e39]/50 pt-1.5 mt-0.5">
                  <span className="text-[#787b86]">Lãi/Lỗ (ROE)</span>
                  <span className={`font-mono ${pnlColor}`}>
                    {pnlSign}{pnl.toLocaleString('vi-VN')} ₫ ({pnlSign}{pnlPercent.toFixed(2)}%)
                  </span>
                </div>

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleTrade('close')}
                    className="flex-1 bg-gray-500 dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-500 active:scale-95 text-white font-bold py-1.5 rounded text-xs transition-all shadow-sm"
                  >
                    ĐÓNG VỊ THẾ
                  </button>
                  {onAddMargin && (
                    <button
                      onClick={async () => {
                        const ans = window.prompt('Nhập số tiền VNĐ muốn bơm thêm vào Ký quỹ để gồng lỗ:');
                        if (!ans) return;
                        const amount = parseInt(ans, 10);
                        if (isNaN(amount) || amount <= 0) return showToast('Số tiền không hợp lệ', false);

                        const res = await onAddMargin(amount);
                        showToast(res.message, res.success);
                      }}
                      className="flex-1 bg-orange-500 dark:bg-orange-600 hover:bg-orange-600 dark:hover:bg-orange-500 active:scale-95 text-white font-bold py-1.5 rounded text-xs transition-all shadow-sm"
                    >
                      + BƠM KÝ QUỸ
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Price & Qty inputs */}
          <div className="flex gap-2 mt-1">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-[10px] text-[#787b86] uppercase tracking-wider">Giá (Thị trường)</label>
              <div className="bg-[#f0f1f3] dark:bg-[#1e222d] border border-[#e6e8ea] dark:border-[#2a2e39] rounded px-3 py-1.5 text-sm text-[#787b86] font-mono cursor-not-allowed">
                {selectedStock.price.toLocaleString('vi-VN')}
              </div>
            </div>

            <div className="flex flex-col gap-1 flex-1">
              <label className="text-[10px] text-[#787b86] uppercase tracking-wider">Khối lượng (Lot)</label>
              <input
                type="number"
                step="0.01"
                value={lotStr}
                onChange={e => setLotStr(e.target.value)}
                className="bg-white dark:bg-[#1e222d] border border-[#e6e8ea] dark:border-[#2a2e39] rounded px-3 py-1.5 text-sm text-[#1e2329] dark:text-white font-mono focus:outline-none focus:border-blue-500 transition-colors w-full"
              />
            </div>
          </div>

          {/* Custom Leverage Slider Inline */}
          <div className="flex flex-col gap-1 mt-1">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] text-[#787b86] uppercase tracking-wider">Đòn bẩy</label>
              <span className="text-xs font-mono font-bold text-white">{leverage}X</span>
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
                   background: `linear-gradient(to right, white ${((leverage - 1) / (leverageInfo.max - 1)) * 100}%, #2a2e39 ${((leverage - 1) / (leverageInfo.max - 1)) * 100}%)`
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
                    <div className="w-2.5 h-2.5 rounded-full bg-white transition-transform group-hover:scale-125 shrink-0 mt-[10px]" />
                    <span className="text-[10px] font-semibold text-white whitespace-nowrap mt-1">1X</span>
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
                       <div className={`w-2.5 h-2.5 rounded-full transition-transform group-hover:scale-125 shrink-0 mt-[10px] ${isActive ? 'bg-white' : 'bg-[#2a2e39]'}`} />
                       <span className={`text-[10px] font-semibold whitespace-nowrap mt-1 transition-colors ${isActive ? 'text-[#d1d4dc] group-hover:text-white' : 'text-[#787b86] group-hover:text-white'}`}>
                         {m}X
                       </span>
                     </div>
                   );
                 })}
               </div>
            </div>
          </div>

          {/* TP / SL inputs (Only show when holding a position) */}
          {held > 0 && (
            <div className="flex gap-2 border-t border-[#e6e8ea] dark:border-[#2a2e39]/50 pt-2 mt-2">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[10px] text-[#089981] uppercase tracking-wider font-semibold">Chốt lời (TP)</label>
                <input
                  type="number"
                  value={tp}
                  placeholder="Tùy chọn"
                  onChange={e => setTp(e.target.value)}
                  className="bg-white dark:bg-[#1e222d] border border-[#e6e8ea] dark:border-[#2a2e39] rounded px-3 py-1.5 text-sm text-[#1e2329] dark:text-white font-mono focus:outline-none focus:border-[#089981] transition-colors w-full placeholder:text-[#a0a3af] dark:placeholder:text-[#434651]"
                />
                <input
                  type="range"
                  min={(avgPrice * 0.5).toFixed(1)}
                  max={(avgPrice * 1.5).toFixed(1)}
                  step="0.1"
                  value={tp || selectedStock.price}
                  onChange={e => setTp(e.target.value)}
                  className="w-full accent-[#089981] mt-1 h-1 bg-[#e6e8ea] dark:bg-[#2a2e39] rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[10px] text-[#f23645] uppercase tracking-wider font-semibold">Cắt lỗ (SL)</label>
                <input
                  type="number"
                  value={sl}
                  placeholder="Tùy chọn"
                  onChange={e => setSl(e.target.value)}
                  className="bg-white dark:bg-[#1e222d] border border-[#e6e8ea] dark:border-[#2a2e39] rounded px-3 py-1.5 text-sm text-[#1e2329] dark:text-white font-mono focus:outline-none focus:border-[#f23645] transition-colors w-full placeholder:text-[#a0a3af] dark:placeholder:text-[#434651]"
                />
                <input
                  type="range"
                  min={(avgPrice * 0.5).toFixed(1)}
                  max={(avgPrice * 1.5).toFixed(1)}
                  step="0.1"
                  value={sl || selectedStock.price}
                  onChange={e => setSl(e.target.value)}
                  className="w-full accent-[#f23645] mt-1 h-1 bg-[#e6e8ea] dark:bg-[#2a2e39] rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Total info */}
          <div className="flex items-center justify-between text-xs pt-2">
            <span className="text-[#787b86]">Ký quỹ yêu cầu</span>
            <span className="font-mono text-[#1e2329] dark:text-[#d1d4dc] font-bold">{requiredMargin.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} ₫</span>
          </div>
          <div className="flex items-center justify-between text-[10px] pb-2">
            <span className="text-[#787b86]">Khối lượng thực tế</span>
            <span className="font-mono text-[#787b86]">{actualQty.toLocaleString('vi-VN')}</span>
          </div>

          {/* Buy / Sell buttons or Update buttons */}
          <div className="flex gap-2">
            {held > 0 ? (
              <button
                onClick={async () => {
                  const currentPrice = selectedStock.price;
                  const tpVal = tp ? parseFloat(tp) : undefined;
                  const slVal = sl ? parseFloat(sl) : undefined;

                  // TP/SL Validation logic
                  if (side === 'LONG') {
                    if (tpVal && tpVal <= currentPrice) return showToast('Lệnh LONG: Giá TP phải LỚN HƠN giá hiện tại!', false);
                    if (slVal && slVal >= currentPrice) return showToast('Lệnh LONG: Giá SL phải NHỎ HƠN giá hiện tại!', false);
                  } else if (side === 'SHORT') {
                    if (tpVal && tpVal >= currentPrice) return showToast('Lệnh SHORT: Giá TP phải NHỎ HƠN giá hiện tại!', false);
                    if (slVal && slVal <= currentPrice) return showToast('Lệnh SHORT: Giá SL phải LỚN HƠN giá hiện tại!', false);
                  }

                  const res = await onUpdateTPSL(tpVal, slVal);
                  showToast(res.message, res.success);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold py-2.5 rounded text-sm transition-all shadow-sm"
              >
                CẬP NHẬT TP/SL
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleTrade('buy')}
                  className="flex-1 bg-[#089981] hover:bg-[#089981]/90 active:scale-95 text-white font-bold py-2.5 rounded text-sm transition-all shadow-sm"
                >
                  LONG
                </button>
                <button
                  onClick={() => handleTrade('sell')}
                  className="flex-1 bg-[#f23645] hover:bg-[#f23645]/90 active:scale-95 text-white font-bold py-2.5 rounded text-sm transition-all shadow-sm"
                >
                  SHORT
                </button>
              </>
            )}
          </div>

          {/* Toast notification */}
          {toast && (
            <div className={`text-xs px-3 py-2 rounded text-center font-medium transition-all shadow-sm ${
              toast.ok ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700' : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700'
            }`}>
              {toast.msg}
            </div>
          )}
        </div>
      ) : (
        <div className="border-t border-[#e6e8ea] dark:border-[#2a2e39] p-6 flex flex-col items-center justify-center text-center gap-4 shrink-0 bg-[#f8f9fa] dark:bg-[#131722] transition-colors">
          <Wallet className="w-8 h-8 text-[#a0a3af] dark:text-[#434651]" />
          <p className="text-[#787b86] text-xs">Vui lòng đăng nhập để xem số dư và thực hiện giao dịch.</p>
          <button 
            onClick={() => login()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded transition-colors shadow-sm"
          >
            Đăng nhập
          </button>
        </div>
      )}
    </div>
  );
};
