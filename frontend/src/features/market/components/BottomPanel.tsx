import { useState, useEffect } from 'react';
import { X, CheckSquare, Square, Settings2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { STOCKS } from '../data';
import { tradingApi } from '../../../services/tradingApi';
import { useAuth } from '../../../contexts/AuthContext';
import { useModal } from '../../../contexts/ModalContext';
import { TradeReviewModal } from '../../ai/TradeReviewModal';

interface Transaction {
  _id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
}

interface BottomPanelProps {
  positions: Record<string, { quantity: number, averagePrice: number, side: 'LONG' | 'SHORT', leverage: number, tp?: number, sl?: number }>;
  pendingOrders: any[];
  selectedSymbol: string;
  currentPrice: number; // For the selected symbol
  onClosePosition: (symbol: string, side: 'LONG' | 'SHORT', price: number) => Promise<{ success: boolean; message: string }>;
  onCancelOrder: (orderId: string) => Promise<void>;
  onUpdateTPSL: (symbol: string, side: 'LONG' | 'SHORT', tp?: number, sl?: number) => Promise<{ success: boolean; message: string }>;
  onAddMargin: (symbol: string, side: 'LONG' | 'SHORT', amount: number) => Promise<{ success: boolean; message: string }>;
  onEditPosition: (symbol: string) => void;
  refreshTrigger: number;
}

export const BottomPanel = ({
  positions,
  pendingOrders,
  selectedSymbol,
  currentPrice,
  onClosePosition,
  onCancelOrder,
  onUpdateTPSL,
  onAddMargin,
  onEditPosition,
  refreshTrigger
}: BottomPanelProps) => {
  const { user } = useAuth();
  const { showAlert } = useModal();
  const [activeTab, setActiveTab] = useState<'positions' | 'orders' | 'order_history' | 'trade_history' | 'position_history' | 'cashflow_history'>('positions');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const [addingMargin, setAddingMargin] = useState<{symbol: string, side: 'LONG'|'SHORT', amount: string} | null>(null);
  const [currentPairOnly, setCurrentPairOnly] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [reviewTradeData, setReviewTradeData] = useState<any | null>(null);

  useEffect(() => {
    if (['order_history', 'trade_history', 'position_history', 'cashflow_history'].includes(activeTab)) {
      const fetchHistory = async () => {
        try {
          const res = await tradingApi.getTransactions(user?._id);
          if (res.success && res.data) {
            setTransactions(res.data);
          }
        } catch (error) {
          console.error('Failed to fetch transactions', error);
        }
      };
      fetchHistory();
    }
  }, [activeTab, refreshTrigger, user]);

  const posList = Object.entries(positions).map(([symbol, p]) => ({ symbol, ...p }));
  const displayPositions = currentPairOnly 
    ? posList.filter(p => p.symbol === selectedSymbol)
    : posList;

  const closedTransactions = transactions.filter(tx => {
    const desc = tx.description || '';
    return desc.includes('Đóng') || desc.includes('Chốt lời') || desc.includes('Cắt lỗ') || (tx.type === 'DEPOSIT' && desc.includes('Lợi nhuận'));
  });

  const tabs = [
    { id: 'positions', label: `Vị thế (${posList.length})` },
    { id: 'orders', label: `Lệnh mở (${pendingOrders.length})` },
    { id: 'order_history', label: 'Lịch sử đặt lệnh' },
    { id: 'trade_history', label: 'Lịch sử giao dịch' },
    { id: 'position_history', label: `Lịch sử vị thế (${closedTransactions.length})` },
    { id: 'cashflow_history', label: 'Lịch sử dòng vốn' }
  ];

  return (
    <div className={`border-t border-[#e6e8ea] dark:border-[#2a2e39] bg-white dark:bg-[#0b0e11] flex flex-col shrink-0 overflow-hidden text-xs text-[#787b86] transition-all duration-300 ${isExpanded ? 'h-64' : 'h-10'}`}>
      {/* Header Tabs */}
      <div className="flex items-center justify-between border-b border-[#e6e8ea] dark:border-[#2a2e39] px-2 h-10 shrink-0">
        <div className="flex items-center gap-6 h-full">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                if (activeTab === tab.id) {
                  setIsExpanded(!isExpanded);
                } else {
                  setActiveTab(tab.id as any);
                  setIsExpanded(true);
                }
              }}
              className={`h-full relative font-medium transition-colors px-1 ${
                activeTab === tab.id && isExpanded
                  ? 'text-[#1e2329] dark:text-white' 
                  : 'hover:text-[#1e2329] dark:hover:text-white text-[#787b86]'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && isExpanded && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#fcd535]" />
              )}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-[#1e2329] dark:hover:text-[#d1d4dc] transition-colors">
            {currentPairOnly ? (
              <CheckSquare className="w-3.5 h-3.5 text-[#fcd535]" />
            ) : (
              <Square className="w-3.5 h-3.5" />
            )}
            <input 
              type="checkbox" 
              className="hidden" 
              checked={currentPairOnly} 
              onChange={() => setCurrentPairOnly(!currentPairOnly)}
            />
            <span className="text-[11px]">Cặp hiện tại</span>
          </label>
          <button className="hover:text-[#1e2329] dark:hover:text-white transition-colors">
            <Settings2 className="w-4 h-4" />
          </button>
          <button 
            onClick={async () => {
              if (displayPositions.length === 0) return;
              for (const p of displayPositions) {
                const markPrice = p.symbol === selectedSymbol ? currentPrice : (STOCKS.find(s => s.symbol === p.symbol)?.price || p.averagePrice);
                await onClosePosition(p.symbol, p.side, markPrice);
              }
            }}
            className="bg-[#f0f3fa] hover:bg-[#e0e5f2] text-[#4b5563] hover:text-[#1e2329] dark:bg-[#2a2e39] dark:hover:bg-[#363a45] dark:text-white px-3 py-1 rounded text-[11px] font-medium transition-colors"
          >
            Đóng toàn bộ
          </button>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="hover:text-[#1e2329] dark:hover:text-white transition-colors border-l border-[#e6e8ea] dark:border-[#2a2e39] pl-4 py-1"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        {activeTab === 'positions' && (
          posList.length > 0 ? (
            <table className="w-full text-left text-xs text-[#1e2329] dark:text-[#d1d4dc]">
              <thead className="sticky top-0 bg-[#f8f9fa] dark:bg-[#0b0e11] text-[#787b86] font-normal text-[11px] border-b border-[#e6e8ea] dark:border-transparent">
                <tr>
                  <th className="px-4 py-2">Symbol</th>
                  <th className="px-4 py-2">Size</th>
                  <th className="px-4 py-2">Entry Price</th>
                  <th className="px-4 py-2">Mark Price</th>
                  <th className="px-4 py-2">Margin</th>
                  <th className="px-4 py-2">Side</th>
                  <th className="px-4 py-2 text-right">PNL (ROE%)</th>
                  <th className="px-4 py-2 text-center">TP / SL</th>
                  <th className="px-4 py-2 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e8ea] dark:divide-[#2a2e39]/50">
                {displayPositions.map(p => {
                  const markPrice = p.symbol === selectedSymbol ? currentPrice : (STOCKS.find(s => s.symbol === p.symbol)?.price || p.averagePrice);
                  const margin = (p.averagePrice * p.quantity) / p.leverage;
                  const pnl = p.side === 'LONG' ? (markPrice - p.averagePrice) * p.quantity : (p.averagePrice - markPrice) * p.quantity;
                  const roe = margin > 0 ? (pnl / margin) * 100 : 0;
                  
                  return (
                    <tr key={p.symbol} className="hover:bg-[#f5f5f5] dark:hover:bg-[#1e222d] transition-colors">
                      <td className="px-4 py-2 font-bold">{p.symbol}</td>
                      <td className="px-4 py-2 font-mono">{p.quantity.toLocaleString('en-US', { maximumFractionDigits: 4 })}</td>
                      <td className="px-4 py-2 font-mono">${p.averagePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-4 py-2 font-mono">${markPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-4 py-2 font-mono">
                        ${margin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        <button onClick={() => setAddingMargin({ symbol: p.symbol, side: p.side, amount: '' })} className="ml-2 text-blue-500 hover:text-blue-400 font-bold">+</button>
                      </td>
                      <td className={`px-4 py-2 font-bold ${p.side === 'LONG' ? 'text-[#089981]' : 'text-[#f23645]'}`}>{p.side} x{p.leverage}</td>
                      <td className={`px-4 py-2 text-right font-mono font-bold ${pnl >= 0 ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                        {pnl >= 0 ? '+' : '-'}${Math.abs(pnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                        <span className="text-[10px] ml-1">({pnl >= 0 ? '+' : ''}{roe.toFixed(2)}%)</span>
                      </td>
                      <td className="px-4 py-2 text-center text-[#787b86]">
                        {p.tp || '-'} / {p.sl || '-'}
                        <button onClick={() => onEditPosition(p.symbol)} className="ml-2 text-blue-500 hover:text-blue-400 font-medium">Sửa</button>
                      </td>
                      <td className="px-4 py-2 text-center flex items-center justify-center gap-1.5">
                        <button 
                          onClick={() => setReviewTradeData({
                            symbol: p.symbol,
                            side: p.side === 'LONG' ? 'BUY' : 'SELL',
                            entryPrice: p.averagePrice,
                            currentPrice: markPrice,
                            stopLoss: p.sl,
                            takeProfit: p.tp,
                            quantity: p.quantity,
                            isOpen: true,
                            timeframe: '15m'
                          })}
                          className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 px-2 py-1 rounded text-[11px] font-semibold transition-colors flex items-center gap-1"
                          title="Đánh giá quy trình lệnh bằng AI"
                        >
                          <Sparkles className="w-3 h-3" /> AI
                        </button>
                        <button 
                          onClick={() => onClosePosition && onClosePosition(p.symbol, p.side, markPrice)}
                          className="bg-[#f0f3fa] hover:bg-[#e0e5f2] text-[#4b5563] hover:text-[#1e2329] dark:bg-[#2a2e39] dark:hover:bg-[#363a45] dark:text-[#d1d4dc] dark:hover:text-white px-2.5 py-1 rounded text-[11px] font-medium transition-colors"
                        >
                          Đóng lệnh
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <EmptyState />
          )
        )}

        {activeTab === 'orders' && (
          <table className="w-full text-left text-xs text-[#1e2329] dark:text-[#d1d4dc]">
            <thead className="sticky top-0 bg-[#f8f9fa] dark:bg-[#0b0e11] text-[#787b86] font-normal text-[11px] border-b border-[#e6e8ea] dark:border-[#2a2e39] transition-colors">
              <tr>
                <th className="px-4 py-2 font-medium">Mã</th>
                <th className="px-4 py-2 font-medium">Loại lệnh</th>
                <th className="px-4 py-2 font-medium">Giá đặt</th>
                <th className="px-4 py-2 font-medium">Khối lượng</th>
                <th className="px-4 py-2 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6e8ea] dark:divide-[#2a2e39]/50">
              {pendingOrders.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-[#787b86]">Không có lệnh mở nào</td></tr>
              ) : (
                pendingOrders.map(order => (
                  <tr key={order._id} className="hover:bg-[#f5f5f5] dark:hover:bg-[#1e222d] transition-colors">
                    <td className="px-4 py-2 font-bold text-[#1e2329] dark:text-white">{order.symbol}</td>
                    <td className="px-4 py-2">
                      <span className={`font-bold mr-1 ${order.side === 'LONG' ? 'text-green-500' : 'text-red-500'}`}>{order.side}</span>
                      {order.type} {order.leverage}x
                    </td>
                    <td className="px-4 py-2 font-mono">{order.price.toLocaleString('vi-VN')}</td>
                    <td className="px-4 py-2 font-mono">{order.quantity?.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right">
                      <button onClick={() => onCancelOrder(order._id)} className="text-red-500 hover:text-red-400 font-bold px-3 py-1 cursor-pointer">Hủy</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {['order_history', 'trade_history', 'position_history', 'cashflow_history'].includes(activeTab) && (() => {
          const filteredTxs = transactions.filter(tx => {
            const desc = tx.description || '';
            if (activeTab === 'position_history') {
              return desc.includes('Đóng') || desc.includes('Chốt lời') || desc.includes('Cắt lỗ') || (tx.type === 'DEPOSIT' && desc.includes('Lợi nhuận'));
            }
            if (activeTab === 'cashflow_history') {
              return desc.includes('Bơm') || desc.includes('Nạp') || desc.includes('Rút') || tx.type === 'DEPOSIT' || tx.type === 'WITHDRAWAL';
            }
            return true;
          });

          return (
            <table className="w-full text-left text-xs text-[#1e2329] dark:text-[#d1d4dc]">
              <thead className="sticky top-0 bg-[#f8f9fa] dark:bg-[#131722] text-[#787b86] font-medium border-b border-[#e6e8ea] dark:border-[#2a2e39] transition-colors">
                <tr>
                  <th className="px-4 py-2 font-medium">Thời gian</th>
                  <th className="px-4 py-2 font-medium">Loại</th>
                  <th className="px-4 py-2 font-medium">Chi tiết</th>
                  <th className="px-4 py-2 font-medium text-center">Trạng thái</th>
                  <th className="px-4 py-2 font-medium text-right">
                    {activeTab === 'position_history' ? 'Lợi nhuận PnL ($)' : 'Biến động ($)'}
                  </th>
                  <th className="px-4 py-2 font-medium text-right">AI Phân Tích</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e8ea] dark:divide-[#2a2e39]/50">
                {filteredTxs.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-[#787b86]">
                    {activeTab === 'position_history' ? 'Chưa có vị thế nào được đóng' : 'Không có giao dịch nào'}
                  </td></tr>
                ) : (
                  filteredTxs.map(tx => {
                  let displayAmount = Math.abs(tx.amount);
                  let isPositive = tx.type === 'SELL_STOCK' || tx.type === 'DEPOSIT';
                  let walletReturnNote = '';

                  // Extract profit from description if available (e.g., "Lợi nhuận: +$1,310" or "Lợi nhuận: $-1,350.37")
                  const profitMatch = (tx.description || '').match(/Lợi nhuận:\s*([^\n\r|]+)/i);
                  if (profitMatch) {
                    const raw = profitMatch[1].trim();
                    const isNeg = raw.includes('-');
                    const cleaned = raw.replace(/[^0-9.]/g, '');
                    const profitNumber = parseFloat(cleaned);
                    if (!isNaN(profitNumber)) {
                      displayAmount = profitNumber;
                      isPositive = !isNeg;
                      if (tx.amount > 0 && Math.abs(tx.amount - profitNumber) > 1) {
                        walletReturnNote = `Hoàn gốc+lãi: $${tx.amount.toLocaleString('vi-VN')}`;
                      }
                    }
                  }

                  const colorClass = isPositive ? 'text-[#089981]' : 'text-[#f23645]';

                  // Helper to format the description beautifully
                  const formatDescription = (desc: string) => {
                    // 1. Check if structured metadata exists on tx
                    if ((tx as any).metadata && (tx as any).metadata.symbol) {
                      const meta = (tx as any).metadata;
                      const isClose = desc.includes('Đóng') || desc.includes('Chốt lời') || desc.includes('Cắt lỗ') || meta.isOpen === false;
                      const action = isClose ? 'Đóng' : 'Mở';
                      const side = (meta.side || 'LONG').toUpperCase();
                      const symbol = meta.symbol;
                      const qty = meta.quantity;
                      const lev = meta.leverage && meta.leverage > 1 ? `x${meta.leverage}` : (desc.match(/x\d+/)?.[0] || '');
                      const price = isClose ? meta.exitPrice : meta.entryPrice;
                      return (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-[#1e2329] dark:text-white">{action} {symbol}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${side === 'LONG' ? 'bg-[#089981]/20 text-[#089981]' : 'bg-[#f23645]/20 text-[#f23645]'}`}>{side}</span>
                          {lev && <span className="text-[#fcd535] bg-[#fcd535]/10 px-1.5 py-0.5 rounded text-[10px] font-bold">{lev}</span>}
                          {qty !== undefined && <span className="text-[#787b86]">KL: <span className="text-[#1e2329] dark:text-[#d1d4dc] font-mono">{parseFloat(qty).toLocaleString('vi-VN', { maximumFractionDigits: 4 })}</span></span>}
                          {price !== undefined && <span className="text-[#787b86]">Giá: <span className="text-[#1e2329] dark:text-[#d1d4dc] font-mono">${parseFloat(price).toLocaleString('vi-VN', { maximumFractionDigits: 2 })}</span></span>}
                        </div>
                      );
                    }

                    // 2. Pattern with pipes: "Mở LONG BTCUSDT ở giá $84,244.01 | Margin: ... | x1 | Qty: 0.10"
                    // or "Đóng LONG 0.1000 BTCUSDT ở giá $84,699.82 | Giá vào: $84,244.01. Lợi nhuận: +$45.58"
                    if (desc.includes('|')) {
                      const parts = desc.split('|').map(p => p.trim());
                      const isClose = desc.includes('Đóng') || desc.includes('Chốt lời') || desc.includes('Cắt lỗ');
                      const action = isClose ? 'Đóng' : 'Mở';
                      const side = desc.includes('SHORT') ? 'SHORT' : 'LONG';
                      let symbol = selectedSymbol;
                      let qty = '';
                      let lev = '';
                      let price = '';

                      // Extract symbol: look for known pairs or any uppercase token
                      const words = parts[0].replace(/^(Đóng|Mở|Chốt lời|Cắt lỗ)/i, '').replace(/ở\s+giá.*/i, '').trim().split(/\s+/);
                      const symCand = words.find(w => !['LONG', 'SHORT', 'BUY', 'SELL'].includes(w.toUpperCase()) && !/^\d/.test(w));
                      if (symCand) symbol = symCand.toUpperCase();

                      // Extract qty
                      parts.forEach(p => {
                        if (p.toLowerCase().startsWith('qty:')) qty = p.substring(4).trim();
                        if (p.toLowerCase().startsWith('x')) lev = p;
                      });
                      if (!qty) {
                        const numCand = words.find(w => /^[\d.,]+$/.test(w));
                        if (numCand) qty = numCand;
                      }

                      // Extract price
                      const pm = parts[0].match(/[\$]([\d,.]+)/) || parts[0].match(/giá\s*[\$:]?\s*([\d,.]+)/i);
                      if (pm) price = pm[1];

                      return (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-[#1e2329] dark:text-white">{action} {symbol}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${side === 'LONG' ? 'bg-[#089981]/20 text-[#089981]' : 'bg-[#f23645]/20 text-[#f23645]'}`}>{side}</span>
                          {lev && <span className="text-[#fcd535] bg-[#fcd535]/10 px-1.5 py-0.5 rounded text-[10px] font-bold">{lev}</span>}
                          {qty && <span className="text-[#787b86]">KL: <span className="text-[#1e2329] dark:text-[#d1d4dc]">{parseFloat(qty).toLocaleString('vi-VN')}</span></span>}
                          {price && <span className="text-[#787b86]">Giá: <span className="text-[#1e2329] dark:text-[#d1d4dc] font-mono">${price}</span></span>}
                        </div>
                      );
                    }
                    
                    // 3. Pattern without pipes: "Đóng LONG 10000.00 FPT ở giá $120.00. Lợi nhuận: -2.700đ"
                    const actionMatch = desc.match(/^(Đóng|Mở|Chốt lời|Cắt lỗ)\s+(LONG|SHORT)\s+([\d.,]+)\s+([A-Z0-9]+)/i);
                    if (actionMatch) {
                      const action = actionMatch[1];
                      const side = actionMatch[2].toUpperCase();
                      const qty = actionMatch[3];
                      const symbol = actionMatch[4];
                      const pm = desc.match(/[\$]([\d,.]+)/) || desc.match(/giá\s*[\$:]?\s*([\d,.]+)/i);
                      const price = pm ? pm[1] : '';
                      return (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-[#1e2329] dark:text-white">{action} {symbol}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${side === 'LONG' ? 'bg-[#089981]/20 text-[#089981]' : 'bg-[#f23645]/20 text-[#f23645]'}`}>{side}</span>
                          <span className="text-[#787b86]">KL: <span className="text-[#1e2329] dark:text-[#d1d4dc]">{parseFloat(qty).toLocaleString('vi-VN')}</span></span>
                          {price && <span className="text-[#787b86]">Giá: <span className="text-[#1e2329] dark:text-[#d1d4dc] font-mono">${price}</span></span>}
                        </div>
                      );
                    }
                    return <span>{desc}</span>;
                  };

                  const getTradeReviewPayload = () => {
                    const desc = tx.description || '';
                    
                    // 1. If structured metadata exists
                    if ((tx as any).metadata && (tx as any).metadata.entryPrice) {
                      const meta = (tx as any).metadata;
                      const isOpen = positions[meta.symbol || ''] && positions[meta.symbol || ''].side === meta.side;
                      return {
                        orderId: tx._id,
                        symbol: meta.symbol || selectedSymbol,
                        side: meta.side === 'SHORT' ? 'SELL' : 'BUY',
                        entryPrice: meta.entryPrice,
                        exitPrice: meta.exitPrice,
                        currentPrice: isOpen ? currentPrice : undefined,
                        stopLoss: meta.stopLoss,
                        takeProfit: meta.takeProfit,
                        quantity: meta.quantity || 1,
                        realPnL: meta.pnl,
                        isOpen: isOpen || meta.isOpen === true,
                        timeframe: '15m'
                      };
                    }

                    // 2. Open pattern: "Mở LONG BTCUSDT ở giá $84,244.01..."
                    let openMatch = desc.match(/(?:Mở)\s+(LONG|SHORT)\s+([A-Z0-9]+)(?:\s+ở\s+giá\s+\$?([\d,.]+))?/i);
                    if (!openMatch) {
                      const m2 = desc.match(/(?:Mở)\s+([A-Z0-9]+)\s+(LONG|SHORT)(?:\s+ở\s+giá\s+\$?([\d,.]+))?/i);
                      if (m2) openMatch = [m2[0], m2[2], m2[1], m2[3]];
                    }

                    // 3. Close pattern: "Đóng LONG 2.00 BTCUSDT ở giá $64,200.5. Lợi nhuận: $-1,350.37"
                    const closeMatch = desc.match(/(?:Đóng|Chốt lời|Cắt lỗ)\s+(LONG|SHORT)\s+([\d.,]+)\s+([A-Z0-9]+)\s+ở\s+giá\s+\$?([\d,.]+).*?Lợi\s*nhuận:\s*([+-]?\$?[\d,.-]+)/i);

                    const qtyMatch = desc.match(/Qty:\s*([\d,.]+)/i) || desc.match(/KL:\s*([\d,.]+)/i);
                    const levMatch = desc.match(/x(\d+)/i);
                    const marginMatch = desc.match(/Margin:\s*\$?([\d,.]+)/i);

                    // Case A: This transaction is a CLOSE transaction
                    if (closeMatch) {
                      const sideStr = closeMatch[1].toUpperCase();
                      const qty = parseFloat(closeMatch[2].replace(/,/g, ''));
                      const sym = closeMatch[3].toUpperCase();
                      const exitP = parseFloat(closeMatch[4].replace(/,/g, ''));
                      const pnl = parseFloat(closeMatch[5].replace(/[$,]/g, ''));

                      let entryP = exitP;
                      const prevOpen = transactions.find(t => {
                        if (t._id === tx._id) return false;
                        const tDesc = t.description || '';
                        return tDesc.includes(`Mở ${sideStr} ${sym}`) || (tDesc.includes(sym) && tDesc.includes(sideStr) && tDesc.includes('Mở'));
                      });

                      if (prevOpen) {
                        const pMatch = prevOpen.description.match(/ở\s+giá\s+\$?([\d,.]+)/i);
                        if (pMatch) entryP = parseFloat(pMatch[1].replace(/,/g, ''));
                      } else {
                        entryP = sideStr === 'LONG' ? (exitP - (pnl / qty)) : (exitP + (pnl / qty));
                      }

                      const entryDate = prevOpen ? new Date(prevOpen.createdAt) : new Date(tx.createdAt);
                      const exitDate = new Date(tx.createdAt);
                      const diffMinutes = Math.max(1, Math.round((exitDate.getTime() - entryDate.getTime()) / 60000));
                      const durationStr = diffMinutes >= 60 ? `${Math.floor(diffMinutes / 60)}h ${diffMinutes % 60}m` : `${diffMinutes} phút`;

                      return {
                        orderId: tx._id,
                        symbol: sym,
                        side: sideStr === 'LONG' ? 'BUY' : 'SELL',
                        entryPrice: entryP,
                        exitPrice: exitP,
                        quantity: qty,
                        realPnL: pnl,
                        isOpen: false,
                        timeframe: '15m',
                        strategy: 'ICT — Liquidity Sweep + FVG',
                        setupName: 'Liquidity sweep + FVG',
                        reason: 'Giao dịch theo tín hiệu quét thanh khoản phiên và kiểm định cấu trúc',
                        entryTime: entryDate.toLocaleString('vi-VN'),
                        exitTime: exitDate.toLocaleString('vi-VN'),
                        duration: durationStr
                      };
                    }

                    // Case B: This transaction is an OPEN transaction
                    if (openMatch) {
                      const sideStr = openMatch[1].toUpperCase();
                      const sym = openMatch[2].toUpperCase();
                      const entryP = openMatch[3] ? parseFloat(openMatch[3].replace(/,/g, '')) : currentPrice;
                      const qty = qtyMatch ? parseFloat(qtyMatch[1].replace(/,/g, '.')) : 0.1;
                      const lev = levMatch ? parseInt(levMatch[1]) : 1;
                      const margin = marginMatch ? parseFloat(marginMatch[1].replace(/,/g, '')) : (entryP * qty) / lev;

                      const openPos = positions[sym] && positions[sym].side === sideStr ? positions[sym] : null;
                      if (openPos) {
                        const entryDate = new Date(tx.createdAt);
                        const now = new Date();
                        const diffMinutes = Math.max(1, Math.round((now.getTime() - entryDate.getTime()) / 60000));
                        const durationStr = diffMinutes >= 60 ? `${Math.floor(diffMinutes / 60)}h ${diffMinutes % 60}m` : `${diffMinutes} phút`;

                        return {
                          orderId: tx._id,
                          symbol: sym,
                          side: sideStr === 'LONG' ? 'BUY' : 'SELL',
                          entryPrice: entryP,
                          currentPrice: currentPrice,
                          stopLoss: openPos.sl,
                          takeProfit: openPos.tp,
                          quantity: qty,
                          isOpen: true,
                          timeframe: '15m',
                          strategy: 'ICT — Liquidity Sweep + FVG',
                          setupName: 'Liquidity sweep + FVG',
                          reason: 'Vào lệnh đón nhịp đảo chiều sau khi quét thanh khoản',
                          entryTime: entryDate.toLocaleString('vi-VN'),
                          duration: durationStr
                        };
                      }

                      // Position is closed! Look for matching close transaction
                      const matchingClose = transactions.find(t => {
                        if (t._id === tx._id) return false;
                        const tDesc = t.description || '';
                        return (tDesc.includes('Đóng') || tDesc.includes('Chốt') || tDesc.includes('Cắt')) && tDesc.includes(sym) && tDesc.includes(sideStr);
                      });

                      if (matchingClose) {
                        const cMatch = matchingClose.description.match(/ở\s+giá\s+\$?([\d,.]+).*?Lợi\s*nhuận:\s*([+-]?\$?[\d,.-]+)/i);
                        const exitP = cMatch ? parseFloat(cMatch[1].replace(/,/g, '')) : currentPrice;
                        const pnl = cMatch ? parseFloat(cMatch[2].replace(/[$,]/g, '')) : (sideStr === 'LONG' ? (exitP - entryP) * qty : (entryP - exitP) * qty);
                        const entryDate = new Date(tx.createdAt);
                        const exitDate = new Date(matchingClose.createdAt);
                        const diffMinutes = Math.max(1, Math.round((exitDate.getTime() - entryDate.getTime()) / 60000));
                        const durationStr = diffMinutes >= 60 ? `${Math.floor(diffMinutes / 60)}h ${diffMinutes % 60}m` : `${diffMinutes} phút`;

                        return {
                          orderId: tx._id,
                          symbol: sym,
                          side: sideStr === 'LONG' ? 'BUY' : 'SELL',
                          entryPrice: entryP,
                          exitPrice: exitP,
                          quantity: qty,
                          realPnL: pnl,
                          isOpen: false,
                          timeframe: '15m',
                          strategy: 'ICT — Liquidity Sweep + FVG',
                          setupName: 'Liquidity sweep + FVG',
                          reason: 'Quét thanh khoản cản cũ và kích hoạt đảo chiều',
                          entryTime: entryDate.toLocaleString('vi-VN'),
                          exitTime: exitDate.toLocaleString('vi-VN'),
                          duration: durationStr
                        };
                      }

                      // If closed without explicit close transaction (liquidated or full margin lost)
                      const lossPnl = -Math.abs(tx.amount || margin);
                      const exitP = sideStr === 'LONG' ? Math.max(0, entryP + (lossPnl / qty)) : (entryP - (lossPnl / qty));
                      const entryDate = new Date(tx.createdAt);

                      return {
                        orderId: tx._id,
                        symbol: sym,
                        side: sideStr === 'LONG' ? 'BUY' : 'SELL',
                        entryPrice: entryP,
                        exitPrice: exitP,
                        quantity: qty,
                        realPnL: lossPnl,
                        isOpen: false,
                        timeframe: '15m',
                        strategy: 'ICT — Liquidity Sweep + FVG',
                        setupName: 'Liquidity sweep + FVG',
                        reason: 'Chạm điểm thanh lý/kết thúc vị thế',
                        entryTime: entryDate.toLocaleString('vi-VN'),
                        duration: 'Khoảng 15 phút'
                      };
                    }

                    // Fallback
                    const isBuy = tx.type.includes('BUY') || desc.toLowerCase().includes('mua') || desc.includes('LONG');
                    const qty = qtyMatch ? parseFloat(qtyMatch[1].replace(/,/g, '.')) : 0.1;
                    const pnl = tx.type === 'BUY_STOCK' ? -Math.abs(tx.amount) : tx.amount;
                    return {
                      orderId: tx._id,
                      symbol: selectedSymbol,
                      side: isBuy ? 'BUY' : 'SELL',
                      entryPrice: currentPrice,
                      exitPrice: currentPrice,
                      quantity: qty,
                      realPnL: pnl,
                      isOpen: false,
                      timeframe: '15m'
                    };
                  };

                  return (
                    <tr key={tx._id} className="hover:bg-[#f5f5f5] dark:hover:bg-[#1e222d] transition-colors">
                      <td className="px-4 py-2 text-[#787b86]">
                        {new Date(tx.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${tx.type.includes('BUY') ? 'bg-[#f23645]/20 text-[#f23645]' :
                            tx.type.includes('SELL') ? 'bg-[#089981]/20 text-[#089981]' : 'bg-blue-500/20 text-blue-400'
                          }`}>
                          {tx.type.replace('_STOCK', '')}
                        </span>
                      </td>
                      <td className="px-4 py-2">{formatDescription(tx.description)}</td>

                      <td className="px-4 py-2 text-center">
                        {(() => {
                          const desc = tx.description || '';
                          const isCloseTx = desc.includes('Đóng') || desc.includes('Chốt lời') || desc.includes('Cắt lỗ');
                          const symMatch = desc.match(/(?:LONG|SHORT)\s+([A-Z0-9]+)|([A-Z0-9]+)\s+(?:LONG|SHORT)/i);
                          const sym = symMatch ? (symMatch[1] || symMatch[2]).toUpperCase() : selectedSymbol;
                          const isOpenPos = !isCloseTx && Boolean(positions[sym]);

                          if (isOpenPos) {
                            return (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                                Đang mở
                              </span>
                            );
                          }
                          return (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-700/30 text-slate-400 border border-slate-600/30 inline-block">
                              Đã đóng
                            </span>
                          );
                        })()}
                      </td>

                      <td className={`px-4 py-2 text-right font-mono font-semibold ${colorClass}`}>
                        {isPositive ? '+' : '-'}${displayAmount.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={() => {
                            const payload = getTradeReviewPayload();
                            setReviewTradeData(payload);
                          }}
                          className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[10px] font-semibold inline-flex items-center gap-1 transition-colors"
                        >
                          <Sparkles className="w-2.5 h-2.5" /> Review
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          );
        })()}
      </div>

      {/* Add Margin Modal */}
      {addingMargin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1e222d] rounded-xl w-[320px] p-5 shadow-2xl border border-[#e6e8ea] dark:border-[#2a2e39]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[#1e2329] dark:text-white font-semibold">Thêm ký quỹ ({addingMargin.symbol})</h3>
              <button onClick={() => setAddingMargin(null)} className="text-[#787b86] hover:text-[#1e2329] dark:hover:text-white transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[#787b86] text-xs mb-1">Số tiền muốn bơm thêm (VNĐ)</label>
                <input 
                  type="number" 
                  value={addingMargin.amount}
                  onChange={e => setAddingMargin({...addingMargin, amount: e.target.value})}
                  className="w-full bg-[#f8f9fa] dark:bg-[#131722] border border-[#e6e8ea] dark:border-[#2a2e39] rounded px-3 py-2 text-[#1e2329] dark:text-white focus:outline-none focus:border-[#2962ff] font-mono text-sm"
                  placeholder="Ví dụ: 1000000"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setAddingMargin(null)}
                className="flex-1 py-2 rounded font-medium text-[#4b5563] dark:text-[#d1d4dc] bg-[#f0f1f3] hover:bg-[#e0e5f2] dark:bg-[#2a2e39] dark:hover:bg-[#363a45] transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button 
                onClick={async () => {
                  const amt = parseInt(addingMargin.amount, 10);
                  if (!isNaN(amt) && amt > 0) {
                    const res = await onAddMargin(addingMargin.symbol, addingMargin.side, amt);
                    showAlert({
                      title: res.success ? 'Ký quỹ thành công' : 'Ký quỹ thất bại',
                      message: res.message,
                      type: res.success ? 'success' : 'error'
                    });
                    if (res.success) setAddingMargin(null);
                  }
                }}
                className="flex-1 py-2 rounded font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trade Review Modal */}
      {reviewTradeData && (
        <TradeReviewModal
          isOpen={true}
          onClose={() => setReviewTradeData(null)}
          tradeData={reviewTradeData}
        />
      )}
    </div>
  );
};

const EmptyState = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
    {/* SVG Graphic mimicking the screenshot */}
    <div className="relative w-24 h-24 mb-4">
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-80">
        {/* Box/Folder base */}
        <path d="M20 50 L50 65 L80 50 L80 80 L50 95 L20 80 Z" className="fill-[#f8f9fa] dark:fill-[#1e222d] stroke-[#e6e8ea] dark:stroke-[#2a2e39]" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M20 50 L50 35 L80 50 L50 65 Z" className="fill-[#f0f3fa] dark:fill-[#2a2e39] stroke-[#e6e8ea] dark:stroke-[#363a45]" strokeWidth="2" strokeLinejoin="round"/>
        {/* Paper */}
        <path d="M35 35 L65 35 L65 55 L35 55 Z" fill="#ffffff" transform="matrix(0.866 0.5 -0.866 0.5 50 10)" opacity="0.9"/>
        {/* Dotted lines on paper */}
        <path d="M45 42 L55 42" stroke="#d1d4dc" strokeWidth="2" strokeDasharray="2 2" transform="matrix(0.866 0.5 -0.866 0.5 50 10)"/>
        {/* Magnifying Glass */}
        <circle cx="55" cy="25" r="12" fill="#f8f9fa" stroke="#d1d4dc" strokeWidth="3"/>
        <circle cx="55" cy="25" r="8" fill="#e2e8f0" opacity="0.5"/>
        <line x1="63" y1="33" x2="75" y2="45" stroke="#d1d4dc" strokeWidth="4" strokeLinecap="round"/>
      </svg>
    </div>
    
    <div className="text-[#1e2329] dark:text-[#d1d4dc] font-semibold text-sm mb-1">Không có vị thế mở</div>
    <div className="text-[#787b86] text-[11px] mb-6">Thực hiện giao dịch live, giao dịch demo hoặc giao dịch sao chép</div>
    
    <div className="flex gap-3 pointer-events-auto">
      <button className="bg-[#f0f3fa] hover:bg-[#e0e5f2] text-[#4b5563] hover:text-[#1e2329] dark:bg-[#2a2e39] dark:hover:bg-[#363a45] dark:text-[#d1d4dc] dark:hover:text-white px-4 py-1.5 rounded-full text-[11px] font-medium transition-colors">
        Giao dịch Demo
      </button>
      <button className="bg-[#f0f3fa] hover:bg-[#e0e5f2] text-[#4b5563] hover:text-[#1e2329] dark:bg-[#2a2e39] dark:hover:bg-[#363a45] dark:text-[#d1d4dc] dark:hover:text-white px-4 py-1.5 rounded-full text-[11px] font-medium transition-colors">
        Giao Dịch Sao Chép
      </button>
      <button className="bg-[#f0f3fa] hover:bg-[#e0e5f2] text-[#4b5563] hover:text-[#1e2329] dark:bg-[#2a2e39] dark:hover:bg-[#363a45] dark:text-[#d1d4dc] dark:hover:text-white px-4 py-1.5 rounded-full text-[11px] font-medium transition-colors">
        Bot
      </button>
    </div>
  </div>
);
