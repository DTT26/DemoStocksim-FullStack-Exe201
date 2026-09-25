import { useState, useEffect } from 'react';
import { X, CheckSquare, Square, Settings2, ChevronDown, ChevronUp } from 'lucide-react';
import { STOCKS } from '../data';
import { tradingApi } from '../../../services/tradingApi';
import { useModal } from '../../../contexts/ModalContext';

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
  const { showAlert } = useModal();
  const [activeTab, setActiveTab] = useState<'positions' | 'orders' | 'order_history' | 'trade_history' | 'position_history' | 'cashflow_history'>('positions');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const [addingMargin, setAddingMargin] = useState<{symbol: string, side: 'LONG'|'SHORT', amount: string} | null>(null);
  const [closingPos, setClosingPos] = useState<{symbol: string, side: 'LONG'|'SHORT', price: number, maxQty: number, closeQty: string} | null>(null);
  const [currentPairOnly, setCurrentPairOnly] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (['order_history', 'trade_history', 'position_history', 'cashflow_history'].includes(activeTab)) {
      const fetchHistory = async () => {
        try {
          const res = await tradingApi.getTransactions();
          if (res.success && res.data) {
            setTransactions(res.data);
          }
        } catch (error) {
          console.error('Failed to fetch transactions', error);
        }
      };
      fetchHistory();
    }
  }, [activeTab, refreshTrigger]);

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
      return tx.type === 'CLOSE_POSITION';
    }
    if (activeTab === 'cashflow_history') {
      return true; // Hiển thị tất cả giao dịch vì đều liên quan tới biến động số dư / ký quỹ
    }
    return true;
  });

  const tabs = [
    { id: 'positions', label: `Vị thế (${posList.length})` },
    { id: 'orders', label: `Lệnh mở (${pendingOrders.length})` },
    { id: 'order_history', label: 'Lịch sử đặt lệnh' },
    { id: 'trade_history', label: 'Lịch sử giao dịch' },
    { id: 'position_history', label: 'Lịch sử vị thế' },
    { id: 'cashflow_history', label: 'Biến động số dư' }
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
                const markPx = p.symbol === selectedSymbol ? currentPrice : (STOCKS.find(s => s.symbol === p.symbol)?.price || p.averagePrice);
                await onClosePosition(p.symbol, p.side, markPx);
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
                  const markPrice = p.symbol === selectedSymbol ? currentPrice : (STOCKS.find(s => s.symbol === p.symbol)?.price || p.averagePrice);
                  const margin = (p.averagePrice * p.quantity) / p.leverage;
                  const pnl = p.side === 'LONG' ? (markPrice - p.averagePrice) * p.quantity : (p.averagePrice - markPrice) * p.quantity;
                  const roe = margin > 0 ? (pnl / margin) * 100 : 0;
                  
                  return (
                    <tr key={p.symbol} className="hover:bg-[#f5f5f5] dark:hover:bg-[#1e222d] transition-colors">
                      <td className="px-4 py-2 font-bold">{p.symbol}</td>
                      <td className="px-4 py-2 font-mono">{p.quantity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} Lot</td>
                      <td className="px-4 py-2 font-mono">{p.averagePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</td>
                      <td className="px-4 py-2 font-mono">{markPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</td>
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
                            {margin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            <button onClick={() => setAddingMargin({ symbol: p.symbol, side: p.side, amount: '' })} className="ml-2 text-blue-500 hover:text-blue-400 font-bold" title="Bơm thêm ký quỹ">+</button>
                          </>
                        )}
                      </td>
                      <td className={`px-4 py-2 font-bold ${p.side === 'LONG' ? 'text-[#089981]' : 'text-[#f23645]'}`}>{p.side} x{(p.leverage % 1 !== 0) ? p.leverage.toFixed(2) : p.leverage}</td>
                      <td className={`px-4 py-2 text-right font-mono font-bold ${pnl >= 0 ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                        {pnl >= 0 ? '+' : ''}{Math.abs(pnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                        <span className="text-[10px] ml-1">({pnl >= 0 ? '+' : ''}{roe.toFixed(2)}%)</span>
                      </td>
                      <td className="px-4 py-2 text-center text-[#787b86]">
                        {p.tp ? p.tp.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'} / {p.sl ? p.sl.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'}
                        <button onClick={() => onEditPosition(p.symbol)} className="ml-2 text-blue-500 hover:text-blue-400 font-medium">Sửa</button>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button 
                          onClick={() => setClosingPos({ symbol: p.symbol, side: p.side, price: markPrice, maxQty: p.quantity, closeQty: p.quantity.toString() })}
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
            <thead className="sticky top-0 bg-[#f8f9fa] dark:bg-[#0b0e11] text-[#787b86] font-normal text-[11px] border-b border-[#e6e8ea] dark:border-transparent">
              <tr>
                <th className="px-4 py-2 font-medium">Mã</th>
                <th className="px-4 py-2 font-medium">Loại lệnh</th>
                <th className="px-4 py-2 font-medium">Giá đặt</th>
                <th className="px-4 py-2 font-medium">Khối lượng</th>
                <th className="px-4 py-2 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e39]/50">
              {displayPendingOrders.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-[#787b86]">Không có lệnh chờ nào</td></tr>
              ) : (
                displayPendingOrders.map(order => (
                  <tr key={order._id} className="hover:bg-[#1e222d] transition-colors">
                    <td className="px-4 py-2 font-bold text-white">{order.symbol}</td>
                    <td className="px-4 py-2">
                      <span className={`font-bold mr-1 ${order.side === 'LONG' ? 'text-green-500' : 'text-red-500'}`}>{order.side}</span>
                      {order.type} {order.leverage}x
                    </td>
                    <td className="px-4 py-2 font-mono">{order.price >= 100 ? order.price.toLocaleString('vi-VN') : order.price?.toFixed(2)}</td>
                    <td className="px-4 py-2 font-mono">{order.quantity?.toFixed(4)} Lot</td>
                    <td className="px-4 py-2 text-right">
                      <button onClick={() => onCancelOrder(order._id)} className="text-red-500 hover:text-red-400 font-bold px-3 py-1">Hủy</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {['order_history', 'trade_history', 'position_history', 'cashflow_history'].includes(activeTab) && (
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-[#131722] text-[#787b86] font-medium border-b border-[#2a2e39]">
              <tr>
                <th className="px-4 py-2 font-medium">Thời gian</th>
                <th className="px-4 py-2 font-medium">Loại</th>
                <th className="px-4 py-2 font-medium">Chi tiết lệnh</th>
                <th className="px-4 py-2 font-medium text-right">Biến động số dư</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6e8ea] dark:divide-[#2a2e39]/50">
              {filteredTransactions.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-[#787b86]">Không có dữ liệu trong mục này</td></tr>
              ) : (
                filteredTransactions.map(tx => {
                  const isPositive = tx.amount >= 0;
                  const colorClass = isPositive ? 'text-[#089981]' : 'text-[#f23645]';

                  // Format badges for transaction types
                  const renderTypeBadge = (type: string) => {
                    if (type === 'BUY_STOCK') {
                      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#089981]/20 text-[#089981]">MỞ LONG</span>;
                    } else if (type === 'SELL_STOCK') {
                      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f23645]/20 text-[#f23645]">MỞ SHORT</span>;
                    } else if (type === 'CLOSE_POSITION') {
                      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400">ĐÓNG VỊ THẾ</span>;
                    } else if (type === 'DEPOSIT') {
                      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400">NẠP / HOÀN TIỀN</span>;
                    } else if (type === 'WITHDRAWAL') {
                      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">RÚT TIỀN</span>;
                    }
                    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-500/20 text-gray-400">{type}</span>;
                  };

                  // Format description cleanly
                  const formatDescription = (desc: string) => {
                    if (desc.includes('|')) {
                      const parts = desc.split('|').map(p => p.trim());
                      return (
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          {parts.map((p, idx) => {
                            if (idx === 0) {
                              const match = p.match(/(.*ở giá )([\d.,]+)(.*)/);
                              if (match) {
                                return (
                                  <span key={idx} className="font-bold text-[#1e2329] dark:text-[#d1d4dc]">
                                    {match[1]}<span className="text-[#fcd535]">{match[2]}</span>{match[3]}
                                  </span>
                                );
                              }
                              return <span key={idx} className="font-bold text-[#1e2329] dark:text-[#d1d4dc]">{p}</span>;
                            }
                            const lowerP = p.toLowerCase();
                            if (lowerP.startsWith('x')) {
                              return <span key={idx} className="text-[#fcd535] bg-[#fcd535]/10 px-1.5 py-0.5 rounded text-[10px] font-bold">{p}</span>;
                            } else if (lowerP.startsWith('lợi nhuận:')) {
                              const isWin = p.includes('+');
                              let displayText = p;
                              // Retroactive fix for old transactions in DB that missed the '-' sign
                              if (!isWin && !p.includes('-')) {
                                displayText = p.replace(/Lợi nhuận:\s*/i, 'Lợi nhuận: -');
                              }
                              return <span key={idx} className={`px-1.5 py-0.5 rounded text-[11px] font-bold border ${isWin ? 'text-[#089981] bg-[#089981]/10 border-[#089981]/20' : 'text-[#f23645] bg-[#f23645]/10 border-[#f23645]/20'}`}>{displayText}</span>;
                            } else if (lowerP.startsWith('vốn về:')) {
                              return <span key={idx} className="text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded text-[11px] font-bold border border-blue-500/20">{p}</span>;
                            } else if (lowerP.startsWith('margin:')) {
                              return <span key={idx} className="text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded text-[11px] font-bold border border-purple-500/20">{p}</span>;
                            } else if (lowerP.startsWith('qty:')) {
                              return <span key={idx} className="text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded text-[11px] font-bold border border-amber-500/20">{p}</span>;
                            }
                            return <span key={idx} className="text-[#787b86] text-[11px] bg-[#1e222d] px-1.5 py-0.5 rounded border border-[#2a2e39] font-medium">{p}</span>;
                          })}
                        </div>
                      );
                    }
                    return <span className="text-[#d1d4dc] text-xs">{desc}</span>;
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
                      <td className={`px-4 py-2 text-right font-mono font-bold ${colorClass}`}>
                        {isPositive ? '+' : '-'}{Math.abs(tx.amount) >= 100 ? Math.abs(tx.amount).toLocaleString('vi-VN') : Math.abs(tx.amount).toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
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
