import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { STOCKS, type Stock, generateOHLCV } from '../data';
import { AssetAvatar } from './AssetAvatar';
import { useAuth } from '../../../contexts/AuthContext';

interface RightSidebarProps {
  selectedStock: Stock;
  positions: Record<string, number>;
  balance: number;
  onStockSelect: (stock: Stock) => void;
  onTrade: (type: 'buy' | 'sell', price: number, qty: number, tp?: number, sl?: number) => { success: boolean; message: string };
}

export const RightSidebar = ({ selectedStock, positions, balance, onStockSelect, onTrade }: RightSidebarProps) => {
  const { user, login } = useAuth();
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');
  const [price, setPrice] = useState<string>(selectedStock.price.toString());
  const [qty, setQty] = useState<string>('100');
  const [tp, setTp] = useState<string>('');
  const [sl, setSl] = useState<string>('');
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  // Sync price input when stock changes
  useEffect(() => {
    setPrice(selectedStock.price.toString());
  }, [selectedStock.symbol]);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const handleTrade = (type: 'buy' | 'sell') => {
    // Lệnh Market: lấy giá hiện tại của cổ phiếu
    // Lệnh Limit: lấy giá người dùng nhập
    const p = orderType === 'market' ? selectedStock.price : parseFloat(price);
    const q = parseInt(qty, 10);
    const tpVal = tp ? parseFloat(tp) : undefined;
    const slVal = sl ? parseFloat(sl) : undefined;

    if (isNaN(p) || isNaN(q) || q <= 0) return showToast('Giá hoặc số lượng không hợp lệ', false);
    
    const result = onTrade(type, p, q, tpVal, slVal);
    showToast(result.message, result.success);
  };

  const pTotal = orderType === 'market' ? selectedStock.price : (parseFloat(price) || 0);
  const total = pTotal * (parseInt(qty) || 0);
  const held = positions[selectedStock.symbol] || 0;

  return (
    <div className="w-[280px] border-l border-[#2a2e39] flex flex-col bg-[#131722] shrink-0 overflow-hidden">

      {/* Watchlist */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex px-3 py-2 border-b border-[#2a2e39] text-[10px] uppercase tracking-wider text-[#787b86] font-semibold">
          <div className="flex-1">Symbol</div>
          <div className="w-20 text-right">Price</div>
          <div className="w-14 text-right">Chg%</div>
        </div>

        {STOCKS.map(stock => (
          <div
            key={stock.symbol}
            onClick={() => { onStockSelect(stock); setPrice(stock.price.toString()); }}
            className={`flex items-center px-3 py-2 text-xs cursor-pointer transition-all border-b border-[#2a2e39]/40 ${
              selectedStock.symbol === stock.symbol
                ? 'bg-blue-900/20 border-l-2 border-l-blue-500'
                : 'hover:bg-[#1e222d]'
            }`}
          >
            {/* Asset Avatar */}
            <div className="mr-2 shrink-0">
              <AssetAvatar stock={stock} size="sm" showExchangeBadge />
            </div>

            <div className="flex-1 flex flex-col truncate pr-1 min-w-0">
              <span className="text-[#d1d4dc] font-bold truncate text-[11px] leading-tight">{stock.symbol}</span>
              <span className="text-[#787b86] text-[9px] truncate leading-tight">{stock.name}</span>
            </div>

            <div className="flex flex-col items-end shrink-0">
              <span className={`font-mono font-semibold text-[10px] ${
                stock.type === 'up' ? 'text-[#089981]' : 'text-[#f23645]'
              }`}>
                {stock.price.toLocaleString('vi-VN')}
              </span>
              <div className={`flex items-center gap-0.5 text-[9px] ${
                stock.type === 'up' ? 'text-[#089981]' : 'text-[#f23645]'
              }`}>
                {stock.type === 'up' ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                <span>{Math.abs(stock.percent).toFixed(2)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Entry */}
      {user ? (
        <div className="border-t border-[#2a2e39] p-3 flex flex-col gap-2.5 shrink-0">
          {/* Balance row */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-[#787b86]">
              <Wallet className="w-3 h-3" />
              <span>Balance</span>
            </div>
            <span className="font-mono text-green-400 font-semibold">{balance.toLocaleString('vi-VN')} ₫</span>
          </div>

          {/* Holding */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#787b86]">Holding {selectedStock.symbol}</span>
            <span className="font-mono text-[#d1d4dc]">{held.toLocaleString()} shares</span>
          </div>

          {/* Order type */}
          <div className="flex gap-1.5 text-xs font-semibold">
            {(['limit', 'market'] as const).map(t => (
              <button
                key={t}
                onClick={() => setOrderType(t)}
                className={`flex-1 py-1.5 rounded capitalize transition-colors ${
                  orderType === t ? 'bg-blue-600 text-white' : 'bg-[#1e222d] text-[#787b86] hover:text-[#d1d4dc]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Price & Qty inputs */}
          <div className="flex gap-2">
            {orderType === 'limit' && (
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[10px] text-[#787b86] uppercase tracking-wider">Giá (VND)</label>
                <input
                  type="number"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className="bg-[#1e222d] border border-[#2a2e39] rounded px-3 py-1.5 text-sm text-white font-mono focus:outline-none focus:border-blue-500 transition-colors w-full"
                />
              </div>
            )}
            
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-[10px] text-[#787b86] uppercase tracking-wider">Số lượng</label>
              <input
                type="number"
                value={qty}
                onChange={e => setQty(e.target.value)}
                className="bg-[#1e222d] border border-[#2a2e39] rounded px-3 py-1.5 text-sm text-white font-mono focus:outline-none focus:border-blue-500 transition-colors w-full"
              />
            </div>
          </div>

          {/* TP / SL inputs */}
          <div className="flex gap-2">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-[10px] text-[#089981] uppercase tracking-wider font-semibold">Chốt lời (TP)</label>
              <input
                type="number"
                value={tp}
                placeholder="Tùy chọn"
                onChange={e => setTp(e.target.value)}
                className="bg-[#1e222d] border border-[#2a2e39] rounded px-3 py-1.5 text-sm text-white font-mono focus:outline-none focus:border-blue-500 transition-colors w-full placeholder:text-[#434651]"
              />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-[10px] text-[#f23645] uppercase tracking-wider font-semibold">Cắt lỗ (SL)</label>
              <input
                type="number"
                value={sl}
                placeholder="Tùy chọn"
                onChange={e => setSl(e.target.value)}
                className="bg-[#1e222d] border border-[#2a2e39] rounded px-3 py-1.5 text-sm text-white font-mono focus:outline-none focus:border-blue-500 transition-colors w-full placeholder:text-[#434651]"
              />
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between text-xs">
            <span className="text-[#787b86]">Total</span>
            <span className="font-mono text-[#d1d4dc] font-semibold">{total.toLocaleString('vi-VN')} ₫</span>
          </div>

          {/* Buy / Sell buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleTrade('buy')}
              className="flex-1 bg-[#089981] hover:bg-[#089981]/80 active:scale-95 text-white font-bold py-2.5 rounded text-sm transition-all"
            >
              MUA
            </button>
            <button
              onClick={() => handleTrade('sell')}
              className="flex-1 bg-[#f23645] hover:bg-[#f23645]/80 active:scale-95 text-white font-bold py-2.5 rounded text-sm transition-all"
            >
              BÁN
            </button>
          </div>

          {/* Toast notification */}
          {toast && (
            <div className={`text-xs px-3 py-2 rounded text-center font-medium transition-all ${
              toast.ok ? 'bg-green-900/50 text-green-300 border border-green-700' : 'bg-red-900/50 text-red-300 border border-red-700'
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
