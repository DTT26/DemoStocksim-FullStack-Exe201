import { useState, useMemo, useEffect } from 'react';
import { HelpCircle, ChevronDown, Calculator } from 'lucide-react';
import { STOCKS, type Stock } from '../data';

type MarketCategory = 'forex' | 'crypto' | 'commodity';

interface CalculatorPanelProps {
  initialBalance: number;
  currentStock: Stock;
}

export const CalculatorPanel = ({ initialBalance, currentStock }: CalculatorPanelProps) => {
  const [marketType, setMarketType] = useState<MarketCategory>('forex');
  const [symbol, setSymbol] = useState('');
  const [balance, setBalance] = useState(initialBalance);
  const [riskType, setRiskType] = useState<'%' | '$'>('%');
  const [riskValue, setRiskValue] = useState(1);
  const [leverage, setLeverage] = useState(100);
  const [entryPrice, setEntryPrice] = useState<string>('');
  const [stopLoss, setStopLoss] = useState<string>('');
  const [takeProfit, setTakeProfit] = useState<string>('');

  useEffect(() => {
    let type: MarketCategory = 'forex';
    if (currentStock.market === 'Tiền điện tử (Crypto)') type = 'crypto';
    else if (currentStock.market === 'Hàng hóa' || currentStock.market === 'Chỉ số') type = 'commodity';
    
    setMarketType(type);
    setSymbol(currentStock.symbol);
    setEntryPrice(currentStock.price.toString());
  }, [currentStock.symbol]); // Only reset when parent's selected stock changes

  // Update symbol when user changes market type tab
  const handleMarketTypeChange = (type: MarketCategory) => {
    setMarketType(type);
    let filterMarket = '';
    if (type === 'forex') filterMarket = 'Ngoại hối (Forex)';
    if (type === 'crypto') filterMarket = 'Tiền điện tử (Crypto)';
    if (type === 'commodity') filterMarket = 'Hàng hóa';

    const available = STOCKS.filter(s => 
      s.market === filterMarket || 
      (type === 'commodity' && s.market === 'Chỉ số')
    );
    
    if (available.length > 0) {
      setSymbol(available[0].symbol);
      setEntryPrice(available[0].price.toString());
    } else {
      setSymbol('');
      setEntryPrice('');
    }
  };

  const availableSymbols = useMemo(() => {
    let filterMarket = '';
    if (marketType === 'forex') filterMarket = 'Ngoại hối (Forex)';
    if (marketType === 'crypto') filterMarket = 'Tiền điện tử (Crypto)';
    if (marketType === 'commodity') filterMarket = 'Hàng hóa'; // Or include indices

    return STOCKS.filter(s => 
      s.market === filterMarket || 
      (marketType === 'commodity' && s.market === 'Chỉ số')
    );
  }, [marketType]);

  const riskAmount = useMemo(() => {
    if (riskType === '%') {
      return (balance * riskValue) / 100;
    }
    return riskValue;
  }, [balance, riskType, riskValue]);

  const calculationResult = useMemo(() => {
    const entry = parseFloat(entryPrice);
    const sl = parseFloat(stopLoss);
    
    if (isNaN(entry) || isNaN(sl) || entry <= 0 || sl <= 0 || entry === sl) {
      return null;
    }

    const distance = Math.abs(entry - sl);
    const units = riskAmount / distance;
    
    let lots = 0;
    let contractSize = 100000;
    
    if (marketType === 'forex') {
      contractSize = 100000;
    } else if (marketType === 'commodity') {
      contractSize = 100;
    } else if (marketType === 'crypto') {
      contractSize = 1;
    }
    
    lots = units / contractSize;

    return { lots: lots.toFixed(4), units: units.toFixed(2) };
  }, [entryPrice, stopLoss, riskAmount, marketType]);

  return (
    <div className="w-[320px] border-l border-[#e6e8ea] dark:border-[#2a2e39] bg-white dark:bg-[#131722] shrink-0 h-full flex flex-col text-[#1e2329] dark:text-[#d1d4dc] font-sans">
      
      {/* Header */}
      <div className="flex items-center gap-2 p-4 shrink-0 border-b border-[#e6e8ea] dark:border-[#2a2e39]">
        <h2 className="text-lg font-bold text-[#1e2329] dark:text-white">Tính khối lượng vị thế</h2>
        <button className="w-6 h-6 rounded-full bg-[#f0f1f3] dark:bg-[#1e222d] hover:bg-[#e6e8ea] dark:hover:bg-[#2a2e39] flex items-center justify-center text-[#787b86] transition-colors">
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-5">
        
        <div className="flex gap-2">
          <button 
            onClick={() => handleMarketTypeChange('forex')}
            className={`flex-1 flex flex-col items-center justify-center text-center font-bold text-sm py-2 px-1 rounded-md transition-colors ${
              marketType === 'forex' ? 'bg-[#089981] text-white' : 'bg-[#1e222d] text-[#787b86] hover:text-white'
            }`}
          >
            Ngoại hối <br/><span className="font-normal text-xs">(Forex)</span>
          </button>
          <button 
            onClick={() => handleMarketTypeChange('crypto')}
            className={`flex-1 flex flex-col items-center justify-center text-center font-bold text-sm py-2 px-1 rounded-md transition-colors ${
              marketType === 'crypto' ? 'bg-[#089981] text-white' : 'bg-[#1e222d] text-[#787b86] hover:text-white'
            }`}
          >
            Tiền điện tử <br/><span className="font-normal text-xs">(Crypto)</span>
          </button>
          <button 
            onClick={() => handleMarketTypeChange('commodity')}
            className={`flex-1 flex items-center justify-center text-center font-bold text-sm py-2 px-1 rounded-md transition-colors ${
              marketType === 'commodity' ? 'bg-[#089981] text-white' : 'bg-[#1e222d] text-[#787b86] hover:text-white'
            }`}
          >
            Commodity
          </button>
        </div>

        {/* Symbol Select */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-[#787b86] tracking-wider uppercase">Mã giao dịch</label>
          <div className="relative">
            <select
              value={symbol}
              onChange={e => {
                setSymbol(e.target.value);
                const s = STOCKS.find(x => x.symbol === e.target.value);
                if (s) setEntryPrice(s.price.toString());
              }}
              className="w-full bg-[#1e222d] border border-[#2a2e39] focus:border-[#2962ff] rounded-md px-3 py-2.5 text-sm text-white font-bold outline-none transition-colors appearance-none"
            >
              <option value="" disabled>Chọn mã...</option>
              {availableSymbols.map(s => (
                <option key={s.symbol} value={s.symbol}>{s.symbol}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#787b86] pointer-events-none" />
          </div>
        </div>

        {/* Balance */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-[#787b86] tracking-wider uppercase">Số dư tài khoản ($)</label>
          <input 
            type="number"
            value={balance}
            onChange={e => setBalance(parseFloat(e.target.value))}
            className="bg-[#1e222d] border border-[#2a2e39] focus:border-[#2962ff] rounded-md px-3 py-2.5 text-sm text-white font-mono outline-none transition-colors"
          />
        </div>

        {/* Risk */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-[#787b86] tracking-wider uppercase">Mức rủi ro mỗi lệnh</label>
            <div className="flex bg-[#1e222d] rounded overflow-hidden border border-[#2a2e39]">
              <button 
                onClick={() => setRiskType('%')}
                className={`px-2 py-0.5 text-xs font-bold transition-colors ${riskType === '%' ? 'bg-[#089981] text-white' : 'text-[#787b86]'}`}
              >
                %
              </button>
              <button 
                onClick={() => setRiskType('$')}
                className={`px-2 py-0.5 text-xs font-bold transition-colors ${riskType === '$' ? 'bg-[#089981] text-white' : 'text-[#787b86]'}`}
              >
                $
              </button>
            </div>
          </div>
          <input 
            type="number"
            value={riskValue}
            onChange={e => setRiskValue(parseFloat(e.target.value))}
            className="bg-[#1e222d] border border-[#2a2e39] focus:border-[#2962ff] rounded-md px-3 py-2.5 text-sm text-white font-mono outline-none transition-colors"
          />
          
          {riskType === '%' && (
            <div className="flex gap-1.5 mt-1">
              {[0.5, 1, 2, 3].map(pct => (
                <button
                  key={pct}
                  onClick={() => setRiskValue(pct)}
                  className={`flex-1 py-1 text-xs font-semibold rounded transition-colors ${
                    riskValue === pct ? 'bg-[#089981] text-white' : 'bg-[#1e222d] text-[#787b86] hover:bg-[#2a2e39] border border-[#2a2e39]'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          )}
          
          <div className="text-xs text-[#f23645] mt-1 font-mono">
            = ${riskAmount.toFixed(2)}
          </div>
        </div>

        {/* Leverage */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-[#787b86] tracking-wider uppercase">Đòn bẩy</label>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm shrink-0">1 :</span>
            <input 
              type="number"
              value={leverage}
              onChange={e => setLeverage(parseFloat(e.target.value))}
              className="flex-1 bg-[#1e222d] border border-[#2a2e39] focus:border-[#2962ff] rounded-md px-3 py-2.5 text-sm text-white font-mono outline-none transition-colors"
            />
          </div>
        </div>

        {/* Entry */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-[#787b86] tracking-wider uppercase">Giá vào lệnh</label>
          <input 
            type="number"
            value={entryPrice}
            onChange={e => setEntryPrice(e.target.value)}
            className="bg-[#1e222d] border border-[#2a2e39] focus:border-[#2962ff] rounded-md px-3 py-2.5 text-sm text-white font-mono outline-none transition-colors"
          />
        </div>

        {/* Stop Loss */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-[#787b86] tracking-wider uppercase">Cắt lỗ (SL)</label>
          <input 
            type="number"
            value={stopLoss}
            onChange={e => setStopLoss(e.target.value)}
            placeholder="Cắt lỗ (SL)"
            className="bg-[#1e222d] border border-[#2a2e39] focus:border-[#2962ff] rounded-md px-3 py-2.5 text-sm text-white font-mono outline-none transition-colors placeholder:text-[#434651]"
          />
        </div>

        {/* Take Profit */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-[#787b86] tracking-wider uppercase">Chốt lời (TP) <span className="text-[#434651] normal-case">(tùy chọn)</span></label>
            <ChevronDown className="w-3.5 h-3.5 text-[#787b86]" />
          </div>
          <input 
            type="number"
            value={takeProfit}
            onChange={e => setTakeProfit(e.target.value)}
            placeholder="Chốt lời (TP)"
            className="bg-[#1e222d] border border-[#2a2e39] focus:border-[#2962ff] rounded-md px-3 py-2.5 text-sm text-white font-mono outline-none transition-colors placeholder:text-[#434651]"
          />
        </div>

        {/* Calculation Result */}
        {calculationResult && (
          <div className="mt-4 bg-[#089981]/10 border border-[#089981]/30 rounded-lg p-4 flex flex-col gap-2">
            <h3 className="text-sm font-bold text-[#089981] flex items-center gap-2">
              <Calculator className="w-4 h-4" /> Kết quả
            </h3>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#787b86]">Khối lượng đề xuất:</span>
              <span className="font-mono font-bold text-white text-base">{calculationResult.lots} Lots</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#787b86]">Quy mô thực tế (Units):</span>
              <span className="font-mono text-[#d1d4dc]">{calculationResult.units}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
