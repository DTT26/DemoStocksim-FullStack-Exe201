import { useState } from 'react';
import { type Stock } from '../data';
import { useSimulatorStore } from '../engine/useSimulatorStore';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface SimulatorTradingPanelProps {
  selectedStock: Stock;
}

export const SimulatorTradingPanel = ({ selectedStock }: SimulatorTradingPanelProps) => {
  const store = useSimulatorStore();
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT' | 'STOP'>('MARKET');
  const [lot, setLot] = useState<number>(store.session?.config.minLot || 0.01);
  const [price, setPrice] = useState<number>(store.currentPrice);
  const [sl, setSl] = useState<number | ''>('');
  const [tp, setTp] = useState<number | ''>('');
  const [setupTag, setSetupTag] = useState<string>('');

  if (!store.isActive || !store.session) return null;

  const { config } = store.session;
  
  // Calculate dynamic properties
  const currentExecBid = store.currentBid;
  const currentExecAsk = store.currentAsk;
  
  const marginRequired = orderType === 'MARKET' 
    ? (currentExecAsk * lot) / config.leverage 
    : (price * lot) / config.leverage;

  const commRequired = config.commission * lot;
  
  const totalCost = marginRequired; // Spread is already in price. Comm is deducted from PnL.

  const handleTrade = (side: 'LONG' | 'SHORT') => {
    if (orderType === 'MARKET') {
      store.executeMarketOrder(
        side, 
        lot, 
        sl ? Number(sl) : undefined, 
        tp ? Number(tp) : undefined, 
        setupTag || undefined
      );
    } else {
      store.placePendingOrder(
        orderType, 
        side, 
        price, 
        lot, 
        sl ? Number(sl) : undefined, 
        tp ? Number(tp) : undefined, 
        setupTag || undefined
      );
    }
    setSetupTag(''); // Reset after trade
  };

  return (
    <div className="w-[320px] bg-white dark:bg-[#131722] border-l border-[#e6e8ea] dark:border-[#2a2e39] flex flex-col h-full overflow-hidden text-[#1e2329] dark:text-[#d1d4dc] font-sans">
      <div className="p-4 border-b border-[#e6e8ea] dark:border-[#2a2e39] shrink-0">
        <h2 className="text-lg font-bold">Simulator Order</h2>
        <div className="text-sm text-[#787b86]">
          {selectedStock.symbol} &middot; Lvg {config.leverage}x
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4">
        {/* Order Type Tabs */}
        <div className="flex bg-[#f0f1f3] dark:bg-[#1e222d] rounded-md p-1 shrink-0">
          {(['MARKET', 'LIMIT', 'STOP'] as const).map(type => (
            <button
              key={type}
              onClick={() => setOrderType(type)}
              className={`flex-1 py-1 text-xs font-bold rounded transition-colors ${
                orderType === type 
                  ? 'bg-white dark:bg-[#2a2e39] text-[#1e2329] dark:text-white shadow-sm' 
                  : 'text-[#787b86] hover:text-[#1e2329] dark:hover:text-[#d1d4dc]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Form Fields */}
        <div className="flex flex-col gap-4">
          {orderType !== 'MARKET' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#787b86] uppercase">Price</label>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(Number(e.target.value))}
                className="bg-transparent border border-[#e6e8ea] dark:border-[#2a2e39] focus:border-[#2962ff] rounded p-2 text-sm text-[#1e2329] dark:text-white outline-none"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#787b86] uppercase">Khối lượng (Lot)</label>
            <div className="flex items-center">
              <button 
                onClick={() => setLot(l => Math.max(config.minLot, l - config.lotStep))}
                className="bg-[#f0f1f3] dark:bg-[#1e222d] px-3 py-2 rounded-l text-[#1e2329] dark:text-white hover:bg-[#e6e8ea] dark:hover:bg-[#2a2e39]"
              >
                -
              </button>
              <input
                type="number"
                value={lot}
                step={config.lotStep}
                min={config.minLot}
                onChange={e => setLot(Number(e.target.value))}
                className="flex-1 w-0 bg-transparent border-y border-[#e6e8ea] dark:border-[#2a2e39] focus:border-[#2962ff] p-2 text-sm text-center text-[#1e2329] dark:text-white outline-none"
              />
              <button 
                onClick={() => setLot(l => l + config.lotStep)}
                className="bg-[#f0f1f3] dark:bg-[#1e222d] px-3 py-2 rounded-r text-[#1e2329] dark:text-white hover:bg-[#e6e8ea] dark:hover:bg-[#2a2e39]"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-xs font-bold text-[#787b86] uppercase">Take Profit</label>
              <input
                type="number"
                value={tp}
                onChange={e => setTp(e.target.value ? Number(e.target.value) : '')}
                placeholder="Giá TP"
                className="bg-transparent border border-[#e6e8ea] dark:border-[#2a2e39] focus:border-[#2962ff] rounded p-2 text-sm text-[#1e2329] dark:text-white outline-none w-full"
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-xs font-bold text-[#787b86] uppercase">Stop Loss</label>
              <input
                type="number"
                value={sl}
                onChange={e => setSl(e.target.value ? Number(e.target.value) : '')}
                placeholder="Giá SL"
                className="bg-transparent border border-[#e6e8ea] dark:border-[#2a2e39] focus:border-[#2962ff] rounded p-2 text-sm text-[#1e2329] dark:text-white outline-none w-full"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#787b86] uppercase">Setup Tag (Journal)</label>
            <input
              type="text"
              value={setupTag}
              onChange={e => setSetupTag(e.target.value)}
              placeholder="Vd: Breakout, Pinbar..."
              className="bg-transparent border border-[#e6e8ea] dark:border-[#2a2e39] focus:border-[#2962ff] rounded p-2 text-sm text-[#1e2329] dark:text-white outline-none"
            />
          </div>
        </div>

        {/* Risk Calculator / Info */}
        <div className="bg-[#f8f9fa] dark:bg-[#151924] rounded border border-[#e6e8ea] dark:border-[#1e222d] p-3 flex flex-col gap-2 mt-2">
          <div className="flex justify-between text-xs">
            <span className="text-[#787b86]">Yêu cầu Ký quỹ</span>
            <span className="font-mono text-[#1e2329] dark:text-white">${marginRequired.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#787b86]">Phí Hoa hồng</span>
            <span className="font-mono text-[#1e2329] dark:text-white">${commRequired.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs border-t border-[#e6e8ea] dark:border-[#2a2e39] pt-2 mt-1">
            <span className="text-[#787b86]">Spread Mua/Bán</span>
            <span className="font-mono text-xs text-[#1e2329] dark:text-white">
              {currentExecBid.toFixed(2)} / {currentExecAsk.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-xs border-t border-[#e6e8ea] dark:border-[#2a2e39] pt-2 mt-1">
            <span className="text-[#787b86]">Ký quỹ khả dụng ({config.maxMarginPercent}%)</span>
            <span className="font-mono text-xs text-[#1e2329] dark:text-white">
              ${Math.max(0, (store.session.equity * config.maxMarginPercent / 100) - store.session.usedMargin).toFixed(2)}
            </span>
          </div>
          {Math.max(0, (store.session.equity * config.maxMarginPercent / 100) - store.session.usedMargin) < marginRequired && (
            <div className="text-xs text-red-500 font-bold mt-1 text-center bg-red-500/10 py-1 rounded">
              Vượt quá Ký quỹ tối đa cho phép
            </div>
          )}
        </div>
      </div>

      {/* Buy/Sell Buttons */}
      <div className="p-4 border-t border-[#e6e8ea] dark:border-[#2a2e39] flex gap-3 shrink-0">
        <button
          disabled={Math.max(0, (store.session.equity * config.maxMarginPercent / 100) - store.session.usedMargin) < marginRequired}
          onClick={() => handleTrade('SHORT')}
          className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold py-3 rounded flex flex-col items-center justify-center gap-1 transition-colors"
        >
          <div className="flex items-center gap-1 text-sm"><ArrowDown className="w-4 h-4" /> BÁN</div>
          <span className="text-xs opacity-90 font-mono">{currentExecBid.toFixed(2)}</span>
        </button>
        <button
          disabled={Math.max(0, (store.session.equity * config.maxMarginPercent / 100) - store.session.usedMargin) < marginRequired}
          onClick={() => handleTrade('LONG')}
          className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-3 rounded flex flex-col items-center justify-center gap-1 transition-colors"
        >
          <div className="flex items-center gap-1 text-sm"><ArrowUp className="w-4 h-4" /> MUA</div>
          <span className="text-xs opacity-90 font-mono">{currentExecAsk.toFixed(2)}</span>
        </button>
      </div>
    </div>
  );
};
