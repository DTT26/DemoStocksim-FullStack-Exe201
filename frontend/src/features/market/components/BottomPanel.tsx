import { useState, useEffect } from 'react';
import { X, CheckSquare, Square, Settings2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { STOCKS } from '../data';
import { tradingApi } from '../../../services/tradingApi';
import { useAuth } from '../../../contexts/AuthContext';
import { useModal } from '../../../contexts/ModalContext';
import { useI18n } from '../../../contexts/I18nContext';
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
  onClosePosition: (symbol: string, side: 'LONG' | 'SHORT', price: number, closeQty?: number) => Promise<{ success: boolean; message: string }>;
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
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'positions' | 'orders' | 'order_history' | 'trade_history' | 'position_history' | 'cashflow_history'>('positions');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const [addingMargin, setAddingMargin] = useState<{symbol: string, side: 'LONG'|'SHORT', amount: string} | null>(null);
  const [closingPos, setClosingPos] = useState<{symbol: string, side: 'LONG'|'SHORT', price: number, maxQty: number, closeQty: string} | null>(null);
  const [currentPairOnly, setCurrentPairOnly] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [reviewTradeData, setReviewTradeData] = useState<any | null>(null);
  const [priceMap, setPriceMap] = useState<Record<string, number>>({});

  useEffect(() => {
    if (selectedSymbol && currentPrice) {
      setPriceMap(prev => {
        if (prev[selectedSymbol] === currentPrice) return prev;
        return { ...prev, [selectedSymbol]: currentPrice };
      });
    }
  }, [selectedSymbol, currentPrice]);

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

  const displayPendingOrders = currentPairOnly
    ? pendingOrders.filter(o => o.symbol === selectedSymbol)
    : pendingOrders;

  // Filter transactions by tab and active symbol
  const filteredTransactions = transactions.filter(tx => {
    if (currentPairOnly && !tx.description.toLowerCase().includes(selectedSymbol.toLowerCase())) {
      return false;
    }
    if (activeTab === 'order_history') {
      return tx.type === 'BUY_STOCK' || tx.type === 'SELL_STOCK' || tx.description.includes('lệnh chờ');
    }
    if (activeTab === 'trade_history') {
      return tx.type === 'BUY_STOCK' || tx.type === 'SELL_STOCK' || tx.type === 'CLOSE_POSITION';
    }
    if (activeTab === 'position_history') {
      return tx.type === 'CLOSE_POSITION' || (tx.description || '').includes('Đóng') || (tx.description || '').includes('Chốt lời');
    }
    if (activeTab === 'cashflow_history') {
      return true; // Hiển thị tất cả giao dịch vì đều liên quan tới biến động số dư / ký quỹ
    }
    return true;
  });

  const closedTransactions = transactions.filter(tx => {
    const desc = tx.description || '';
    return desc.includes('Đóng') || desc.includes('Chốt lời') || desc.includes('Cắt lỗ') || (tx.type === 'DEPOSIT' && desc.includes('Lợi nhuận'));
  });

  const tabs = [
    { id: 'positions', label: `${t('panel.positions', 'Vị thế')} (${posList.length})` },
    { id: 'orders', label: `${t('panel.orders', 'Lệnh mở')} (${pendingOrders.length})` },
    { id: 'order_history', label: t('panel.orderHistory', 'Lịch sử đặt lệnh') },
    { id: 'trade_history', label: t('panel.tradeHistory', 'Lịch sử giao dịch') },
    { id: 'position_history', label: t('panel.positionHistory', 'Lịch sử vị thế') },
    { id: 'cashflow_history', label: t('panel.cashflowHistory', 'Biến động số dư') }
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
                const markPrice = p.symbol === selectedSymbol ? currentPrice : ((window as any).cachedBinancePrices?.[p.symbol] || priceMap[p.symbol] || p.averagePrice);
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
          displayPositions.length > 0 ? (
            <table className="w-full text-left text-xs text-[#1e2329] dark:text-[#d1d4dc]">
              <thead className="sticky top-0 bg-[#f8f9fa] dark:bg-[#0b0e11] text-[#787b86] font-normal text-[11px] border-b border-[#e6e8ea] dark:border-transparent">
                <tr>
                  <th className="px-4 py-2">Symbol</th>
                  <th className="px-4 py-2">Size</th>
                  <th className="px-4 py-2">Giá mở</th>
                  <th className="px-4 py-2">Giá hiện tại</th>
                  <th className="px-4 py-2">Margin</th>
                  <th className="px-4 py-2">Side</th>
                  <th className="px-4 py-2 text-right">PNL (ROE%)</th>
                  <th className="px-4 py-2 text-center">TP / SL</th>
                  <th className="px-4 py-2 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e8ea] dark:divide-[#2a2e39]/50">
                {displayPositions.map(p => {
                  const markPrice = p.symbol === selectedSymbol ? currentPrice : ((window as any).cachedBinancePrices?.[p.symbol] || priceMap[p.symbol] || p.averagePrice);
                  const margin = (p.averagePrice * p.quantity) / p.leverage;
                  const pnl = p.side === 'LONG' ? (markPrice - p.averagePrice) * p.quantity : (p.averagePrice - markPrice) * p.quantity;
                  const roe = margin > 0 ? (pnl / margin) * 100 : 0;
                  
                  return (
                    <tr key={p.symbol} className="hover:bg-[#f5f5f5] dark:hover:bg-[#1e222d] transition-colors">
                      <td className="px-4 py-2 font-bold">{p.symbol}</td>
                      <td className="px-4 py-2 font-mono">{p.quantity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} Lot</td>
                      <td className="px-4 py-2 font-mono">${p.averagePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</td>
                      <td className="px-4 py-2 font-mono">${markPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</td>
                      <td className="px-4 py-2 font-mono">
                        {addingMargin?.symbol === p.symbol ? (
                          <div className="flex items-center gap-1">
                            <input 
                              type="number" 
                              autoFocus
                              value={addingMargin.amount}
                              onChange={e => setAddingMargin({...addingMargin, amount: e.target.value})}
                              className="w-16 bg-[#1e222d] border border-[#2a2e39] rounded px-1 py-0.5 text-white focus:outline-none focus:border-[#2962ff] text-[10px]"
                            />
                            <button onClick={async () => {
                              const amt = parseFloat(addingMargin.amount);
                              if (!isNaN(amt) && amt > 0) {
                                const res = await onAddMargin(addingMargin.symbol, addingMargin.side, amt);
                                showAlert({ title: res.success ? 'Ký quỹ thành công' : 'Ký quỹ thất bại', message: res.message, type: res.success ? 'success' : 'error' });
                                if (res.success) setAddingMargin(null);
                              }
                            }} className="text-green-500 hover:text-green-400 font-bold px-1">✓</button>
                            <button onClick={() => setAddingMargin(null)} className="text-red-500 hover:text-red-400 font-bold px-1">✕</button>
                          </div>
                        ) : (
                          <>
                            ${margin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            <button onClick={() => setAddingMargin({ symbol: p.symbol, side: p.side, amount: '' })} className="ml-2 text-blue-500 hover:text-blue-400 font-bold" title="Bơm thêm ký quỹ">+</button>
                          </>
                        )}
                      </td>
                      <td className={`px-4 py-2 font-bold ${p.side === 'LONG' ? 'text-[#089981]' : 'text-[#f23645]'}`}>{p.side} x{(p.leverage % 1 !== 0) ? p.leverage.toFixed(2) : p.leverage}</td>
                      <td className={`px-4 py-2 text-right font-mono font-bold ${pnl >= 0 ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                        {pnl >= 0 ? '+' : '-'}${Math.abs(pnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                        <span className="text-[10px] ml-1">({pnl >= 0 ? '+' : ''}{roe.toFixed(2)}%)</span>
                      </td>
                      <td className="px-4 py-2 text-center text-[#787b86]">
                        {p.tp ? p.tp.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'} / {p.sl ? p.sl.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'}
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
                          onClick={async () => {
                            const res = await onClosePosition(p.symbol, p.side, markPrice, p.quantity);
                            showAlert({
                              title: res.success ? 'Đóng vị thế thành công' : 'Đóng vị thế thất bại',
                              message: res.message,
                              type: res.success ? 'success' : 'error'
                            });
                          }}
                          className="bg-[#f0f3fa] hover:bg-[#e0e5f2] text-[#4b5563] hover:text-[#1e2329] dark:bg-[#2a2e39] dark:hover:bg-[#363a45] dark:text-[#d1d4dc] dark:hover:text-white px-3 py-1 rounded text-[11px] font-medium transition-colors"
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
              {displayPendingOrders.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-[#787b86]">Không có lệnh chờ nào</td></tr>
              ) : (
                displayPendingOrders.map(order => (
                  <tr key={order._id} className="hover:bg-[#f5f5f5] dark:hover:bg-[#1e222d] transition-colors">
                    <td className="px-4 py-2 font-bold text-[#1e2329] dark:text-white">{order.symbol}</td>
                    <td className="px-4 py-2">
                      <span className={`font-bold mr-1 ${order.side === 'LONG' ? 'text-green-500' : 'text-red-500'}`}>{order.side}</span>
                      {order.type} {order.leverage}x
                    </td>
                    <td className="px-4 py-2 font-mono">{order.price >= 100 ? order.price.toLocaleString('vi-VN') : order.price?.toFixed(2)}</td>
                    <td className="px-4 py-2 font-mono">{order.quantity?.toFixed(4)} Lot</td>
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
          return (
            <table className="w-full text-left text-xs text-[#1e2329] dark:text-[#d1d4dc]">
              <thead className="sticky top-0 bg-[#f8f9fa] dark:bg-[#131722] text-[#787b86] font-medium border-b border-[#e6e8ea] dark:border-[#2a2e39] transition-colors">
                <tr>
                  <th className="px-4 py-2 font-medium">{t('table.time', 'Thời gian')}</th>
                  <th className="px-4 py-2 font-medium">{t('table.type', 'Loại')}</th>
                  <th className="px-4 py-2 font-medium">{t('table.detail', 'Chi tiết')}</th>
                  <th className="px-4 py-2 font-medium text-center whitespace-nowrap">{t('table.status', 'Trạng thái')}</th>
                  <th className="px-4 py-2 font-medium text-right whitespace-nowrap">
                    {activeTab === 'position_history' ? t('table.pnlOnly', 'Lợi nhuận PnL ($)') : t('table.cashflow', 'Biến động ($)')}
                  </th>
                  <th className="px-4 py-2 font-medium text-right whitespace-nowrap">{t('table.aiAnalysis', 'AI Phân Tích')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e8ea] dark:divide-[#2a2e39]/50">
                {filteredTransactions.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-[#787b86]">
                    {activeTab === 'position_history' ? t('table.noClosedPos', 'Chưa có vị thế nào được đóng') : t('table.noTx', 'Không có giao dịch nào')}
                  </td></tr>
                ) : (
                  filteredTransactions.map(tx => {
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

                  // Format badges for transaction types
                  const renderTypeBadge = (type: string) => {
                    if (type === 'BUY_STOCK') {
                      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#089981]/20 text-[#089981] whitespace-nowrap">MỞ LONG</span>;
                    } else if (type === 'SELL_STOCK') {
                      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f23645]/20 text-[#f23645] whitespace-nowrap">MỞ SHORT</span>;
                    } else if (type === 'CLOSE_POSITION') {
                      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 whitespace-nowrap">ĐÓNG VỊ THẾ</span>;
                    } else if (type === 'DEPOSIT') {
                      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 whitespace-nowrap">NẠP / HOÀN TIỀN</span>;
                    } else if (type === 'WITHDRAWAL') {
                      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 whitespace-nowrap">RÚT TIỀN</span>;
                    }
                    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-500/20 text-gray-400 whitespace-nowrap">{type}</span>;
                  };

                  // Format description cleanly
                  const formatDescription = (desc: string) => {
                    // 2. Pattern with pipes: "Mở LONG BTCUSDT ở giá $84,244.01 | Margin: ... | x1 | Qty: 0.10"
                    // or "Đóng LONG 0.1000 BTCUSDT ở giá $84,699.82 | Giá vào: $84,244.01. Lợi nhuận: +$45.58"
                    if (desc.includes('|')) {
                      const parts = desc.split('|').map(p => p.trim());
                      return (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-[#1e2329] dark:text-white">{parts[0]}</span>
                          {parts.slice(1).map((part, idx) => {
                            let displayText = part;
                            if (/^qty/i.test(displayText)) {
                              displayText = displayText.replace(/^qty/i, 'KL');
                            } else if (/^margin/i.test(displayText)) {
                              displayText = displayText.replace(/^margin/i, 'Ký quỹ');
                            }

                            if (/^x\d+$/i.test(displayText)) {
                              return <span key={idx} className="text-[#fcd535] bg-[#fcd535]/10 px-1.5 py-0.5 rounded text-[10px] font-bold">{displayText}</span>;
                            }
                            if (displayText === 'LONG') {
                              return <span key={idx} className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#089981]/20 text-[#089981]">{displayText}</span>;
                            }
                            if (displayText === 'SHORT') {
                              return <span key={idx} className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#f23645]/20 text-[#f23645]">{displayText}</span>;
                            }
                            
                            let bgClass = "bg-[#f0f3fa] dark:bg-[#2a2e39]";
                            let textClass = "text-[#1e2329] dark:text-[#b7bdc6]";
                            let borderClass = "border-[#e0e3eb] dark:border-[#363a45]";

                            if (displayText.includes('+')) {
                              textClass = "text-[#089981]";
                              bgClass = "bg-[#089981]/10";
                              borderClass = "border-[#089981]/20";
                            } else if (displayText.includes('-')) {
                              textClass = "text-[#f23645]";
                              bgClass = "bg-[#f23645]/10";
                              borderClass = "border-[#f23645]/20";
                            }

                            return (
                              <span key={idx} className={`px-2 py-0.5 rounded text-[11px] font-medium border whitespace-nowrap ${bgClass} ${textClass} ${borderClass}`}>
                                {displayText}
                              </span>
                            );
                          })}
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
                    return <span className="text-[#d1d4dc] text-xs">{desc}</span>;
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
                      <td className="px-4 py-2 text-[#787b86] font-mono text-[11px]">
                        {new Date(tx.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-4 py-2">
                        {renderTypeBadge(tx.type)}
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
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 inline-flex items-center gap-1 whitespace-nowrap">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                                Đang mở
                              </span>
                            );
                          }
                          return (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-700/30 text-slate-400 border border-slate-600/30 inline-block whitespace-nowrap">
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

      {/* Partial Close Modal */}
      {closingPos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1e222d] rounded-xl w-[340px] p-5 shadow-2xl border border-[#2a2e39]">
            <div className="flex justify-between items-center mb-4 border-b border-[#2a2e39] pb-3">
              <div>
                <h3 className="text-white font-bold text-sm">Đóng vị thế {closingPos.symbol}</h3>
                <span className={`text-[11px] font-bold ${closingPos.side === 'LONG' ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                  {closingPos.side} (Đang mở: {closingPos.maxQty.toFixed(4)} Lot)
                </span>
              </div>
              <button onClick={() => setClosingPos(null)} className="text-[#787b86] hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[#787b86] text-xs mb-1">Tỷ lệ đóng vị thế</label>
                <div className="grid grid-cols-4 gap-1.5 mb-3">
                  {[0.25, 0.5, 0.75, 1.0].map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setClosingPos({ ...closingPos, closeQty: (closingPos.maxQty * pct).toFixed(4) })}
                      className={`py-1 rounded text-xs font-mono font-bold border transition-colors ${
                        parseFloat(closingPos.closeQty) === (closingPos.maxQty * pct)
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-[#131722] text-[#d1d4dc] border-[#2a2e39] hover:bg-[#2a2e39]'
                      }`}
                    >
                      {pct * 100}%
                    </button>
                  ))}
                </div>

                <label className="block text-[#787b86] text-xs mb-1">Số Lot muốn đóng</label>
                <input
                  type="number"
                  step="0.01"
                  max={closingPos.maxQty}
                  value={closingPos.closeQty}
                  onChange={e => setClosingPos({ ...closingPos, closeQty: e.target.value })}
                  className="w-full bg-[#131722] border border-[#2a2e39] rounded px-3 py-2 text-white focus:outline-none focus:border-[#2962ff] font-mono text-sm"
                  placeholder="Nhập số lot"
                />
              </div>

              <div className="bg-[#131722] p-3 rounded border border-[#2a2e39] flex flex-col gap-1 text-xs">
                <div className="flex justify-between text-[#787b86]">
                  <span>Giá đóng (Mark Price):</span>
                  <span className="font-mono text-white font-bold">${closingPos.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setClosingPos(null)}
                className="flex-1 py-2 rounded font-medium text-[#d1d4dc] bg-[#2a2e39] hover:bg-[#363a45] transition-colors text-xs"
              >
                Hủy
              </button>
              <button
                onClick={async () => {
                  const qtyToClose = parseFloat(closingPos.closeQty);
                  if (!isNaN(qtyToClose) && qtyToClose > 0) {
                    const res = await onClosePosition(closingPos.symbol, closingPos.side, closingPos.price, qtyToClose);
                    showAlert({
                      title: res.success ? 'Đóng vị thế thành công' : 'Đóng vị thế thất bại',
                      message: res.message,
                      type: res.success ? 'success' : 'error'
                    });
                    if (res.success) setClosingPos(null);
                  }
                }}
                className="flex-1 py-2 rounded font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors text-xs"
              >
                Xác nhận đóng
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
