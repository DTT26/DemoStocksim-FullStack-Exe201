import { useState, useEffect } from 'react';
import { X, CheckSquare, Square, Settings2, ChevronDown, ChevronUp } from 'lucide-react';
import { STOCKS } from '../data';
import { tradingApi } from '../../../services/tradingApi';

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
  const [activeTab, setActiveTab] = useState<'positions' | 'orders' | 'history' | 'trade_history'>('positions');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const [addingMargin, setAddingMargin] = useState<{symbol: string, side: 'LONG'|'SHORT', amount: string} | null>(null);
  const [currentPairOnly, setCurrentPairOnly] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (activeTab === 'trade_history') {
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

  const tabs = [
    { id: 'positions', label: `Vị thế (${posList.length})` },
    { id: 'orders', label: `Lệnh mở (${pendingOrders.length})` },
    { id: 'order_history', label: 'Lịch sử đặt lệnh' },
    { id: 'trade_history', label: 'Lịch sử giao dịch' },
    { id: 'position_history', label: 'Lịch sử vị thế' },
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
          <button className="bg-[#f0f3fa] hover:bg-[#e0e5f2] text-[#4b5563] hover:text-[#1e2329] dark:bg-[#2a2e39] dark:hover:bg-[#363a45] dark:text-white px-3 py-1 rounded text-[11px] font-medium transition-colors">
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
                      <td className="px-4 py-2">{p.quantity.toLocaleString('vi-VN')}</td>
                      <td className="px-4 py-2">{p.averagePrice.toLocaleString('vi-VN')}</td>
                      <td className="px-4 py-2">{markPrice.toLocaleString('vi-VN')}</td>
                      <td className="px-4 py-2">
                        {margin.toLocaleString('vi-VN', { maximumFractionDigits: 0 })}
                        <button onClick={() => setAddingMargin({ symbol: p.symbol, side: p.side, amount: '' })} className="ml-2 text-blue-500 hover:text-blue-400 font-bold">+</button>
                      </td>
                      <td className={`px-4 py-2 font-bold ${p.side === 'LONG' ? 'text-[#089981]' : 'text-[#f23645]'}`}>{p.side} x{p.leverage}</td>
                      <td className={`px-4 py-2 text-right font-mono font-bold ${pnl >= 0 ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                        {pnl >= 0 ? '+' : ''}{pnl.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} 
                        <span className="text-[10px] ml-1">({pnl >= 0 ? '+' : ''}{roe.toFixed(2)}%)</span>
                      </td>
                      <td className="px-4 py-2 text-center text-[#787b86]">
                        {p.tp || '-'} / {p.sl || '-'}
                        <button onClick={() => onEditPosition(p.symbol)} className="ml-2 text-blue-500 hover:text-blue-400 font-medium">Sửa</button>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button 
                          onClick={() => onClosePosition && onClosePosition(p.symbol, p.side, markPrice)}
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
              {pendingOrders.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-[#787b86]">Không có lệnh mở nào</td></tr>
              ) : (
                pendingOrders.map(order => (
                  <tr key={order._id} className="hover:bg-[#1e222d] transition-colors">
                    <td className="px-4 py-2 font-bold text-white">{order.symbol}</td>
                    <td className="px-4 py-2">
                      <span className={`font-bold mr-1 ${order.side === 'LONG' ? 'text-green-500' : 'text-red-500'}`}>{order.side}</span>
                      {order.type} {order.leverage}x
                    </td>
                    <td className="px-4 py-2 font-mono">{order.price.toLocaleString('vi-VN')}</td>
                    <td className="px-4 py-2 font-mono">{order.quantity?.toFixed(2)}</td>
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
                <th className="px-4 py-2 font-medium">Chi tiết</th>
                <th className="px-4 py-2 font-medium text-right">Biến động (VND)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6e8ea] dark:divide-[#2a2e39]/50">
              {transactions.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-[#787b86]">Không có giao dịch nào</td></tr>
              ) : (
                transactions.map(tx => {
                  let displayAmount = Math.abs(tx.amount);
                  let isPositive = tx.type === 'SELL_STOCK' || tx.type === 'DEPOSIT';

                  // Extract profit from description if available (e.g., "Lợi nhuận: -2.700đ")
                  const profitMatch = tx.description.match(/Lợi nhuận:\s*(-?[\d.,]+)đ?/);
                  if (profitMatch) {
                    const profitString = profitMatch[1].replace(/\./g, '').replace(/,/g, '');
                    const profitNumber = parseInt(profitString, 10);
                    if (!isNaN(profitNumber)) {
                      displayAmount = Math.abs(profitNumber);
                      isPositive = profitNumber >= 0;
                    }
                  }

                  const colorClass = isPositive ? 'text-[#089981]' : 'text-[#f23645]';

                  // Helper to format the description beautifully
                  const formatDescription = (desc: string) => {
                    // Case 1: "Mở LONG FPT ở giá 115.00 | Margin: 115670 | x10 | Qty: 10000.00"
                    if (desc.includes('|')) {
                      const parts = desc.split('|').map(p => p.trim());
                      const actionMatch = parts[0].match(/(Mở|Đóng)\s+(LONG|SHORT)\s+([A-Z0-9]+)(?:\s+ở\s+giá\s+([\d.,]+))?/i);
                      if (actionMatch) {
                        const action = actionMatch[1];
                        const side = actionMatch[2].toUpperCase();
                        const symbol = actionMatch[3];
                        const price = actionMatch[4];
                        let qty = '';
                        let lev = '';
                        parts.forEach(p => {
                          if (p.toLowerCase().startsWith('qty:')) qty = p.substring(4).trim();
                          if (p.toLowerCase().startsWith('x')) lev = p;
                        });
                        return (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-[#1e2329] dark:text-white">{action} {symbol}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${side === 'LONG' ? 'bg-[#089981]/20 text-[#089981]' : 'bg-[#f23645]/20 text-[#f23645]'}`}>{side}</span>
                            {lev && <span className="text-[#fcd535] bg-[#fcd535]/10 px-1.5 py-0.5 rounded text-[10px] font-bold">{lev}</span>}
                            {qty && <span className="text-[#787b86]">KL: <span className="text-[#1e2329] dark:text-[#d1d4dc]">{parseFloat(qty).toLocaleString('vi-VN')}</span></span>}
                            {price && <span className="text-[#787b86]">Giá: <span className="text-[#1e2329] dark:text-[#d1d4dc] font-mono">{price}</span></span>}
                          </div>
                        );
                      }
                    }
                    
                    // Case 2: "Đóng LONG 10.000 FPT ở giá 120.00. Lợi nhuận: -2.700đ"
                    const actionMatch = desc.match(/^(Đóng|Mở|Chốt lời|Cắt lỗ)\s+(LONG|SHORT)\s+([\d.,]+)\s+([A-Z0-9]+)(?:\s+ở\s+giá\s+([\d.,]+))?/i);
                    if (actionMatch) {
                      const action = actionMatch[1];
                      const side = actionMatch[2].toUpperCase();
                      const qty = actionMatch[3];
                      const symbol = actionMatch[4];
                      const price = actionMatch[5];
                      return (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-[#1e2329] dark:text-white">{action} {symbol}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${side === 'LONG' ? 'bg-[#089981]/20 text-[#089981]' : 'bg-[#f23645]/20 text-[#f23645]'}`}>{side}</span>
                          <span className="text-[#787b86]">KL: <span className="text-[#1e2329] dark:text-[#d1d4dc]">{qty}</span></span>
                          {price && <span className="text-[#787b86]">Giá: <span className="text-[#1e2329] dark:text-[#d1d4dc] font-mono">{price}</span></span>}
                        </div>
                      );
                    }
                    return <span>{desc}</span>;
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

                      <td className={`px-4 py-2 text-right font-mono font-semibold ${colorClass}`}>
                        {isPositive ? '+' : '-'}{displayAmount.toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Margin Modal */}
      {addingMargin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1e222d] rounded-xl w-[320px] p-5 shadow-2xl border border-[#2a2e39]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold">Thêm ký quỹ ({addingMargin.symbol})</h3>
              <button onClick={() => setAddingMargin(null)} className="text-[#787b86] hover:text-white transition-colors">
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
                  className="w-full bg-[#131722] border border-[#2a2e39] rounded px-3 py-2 text-white focus:outline-none focus:border-[#2962ff] font-mono text-sm"
                  placeholder="Ví dụ: 1000000"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setAddingMargin(null)}
                className="flex-1 py-2 rounded font-medium text-[#d1d4dc] bg-[#2a2e39] hover:bg-[#363a45] transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={async () => {
                  const amt = parseInt(addingMargin.amount, 10);
                  if (!isNaN(amt) && amt > 0) {
                    const res = await onAddMargin(addingMargin.symbol, addingMargin.side, amt);
                    alert(res.message);
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
