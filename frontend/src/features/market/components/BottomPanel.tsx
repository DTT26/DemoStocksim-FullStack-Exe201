import { useEffect, useState } from 'react';
import { Search, Settings2, CheckSquare, Square } from 'lucide-react';
import { tradingApi } from '../../../services/tradingApi';
import { STOCKS, type Stock } from '../data';

interface Transaction {
  _id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
}

interface Position {
  symbol: string;
  quantity: number;
  averagePrice: number;
  side: 'LONG' | 'SHORT';
  leverage: number;
  tp?: number;
  sl?: number;
}

interface BottomPanelProps {
  refreshTrigger: number;
  positions: Record<string, Position>;
  currentStock: Stock;
  onClosePosition?: (symbol: string) => Promise<{ success: boolean; message: string }>;
}

export const BottomPanel = ({ refreshTrigger, positions, currentStock, onClosePosition }: BottomPanelProps) => {
  const [activeTab, setActiveTab] = useState('positions');
  const [currentPairOnly, setCurrentPairOnly] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
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
  }, [refreshTrigger]);

  const tabs = [
    { id: 'positions', label: `Vị thế (${Object.keys(positions).length})` },
    { id: 'open_orders', label: 'Lệnh mở (0)' },
    { id: 'order_history', label: 'Lịch sử đặt lệnh' },
    { id: 'trade_history', label: 'Lịch sử giao dịch' },
    { id: 'position_history', label: 'Lịch sử vị thế' },
    { id: 'fund_flow', label: 'Lịch sử dòng vốn' },
  ];

  const posList = Object.values(positions);

  return (
    <div className="h-64 border-t border-[#e6e8ea] dark:border-[#2a2e39] bg-white dark:bg-[#0b0e11] flex flex-col shrink-0 overflow-hidden text-xs text-[#787b86] transition-colors">
      {/* Header Tabs */}
      <div className="flex items-center justify-between border-b border-[#e6e8ea] dark:border-[#2a2e39] px-2 h-10 shrink-0">
        <div className="flex items-center gap-6 h-full">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`h-full relative font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'text-[#1e2329] dark:text-white' 
                  : 'hover:text-[#1e2329] dark:hover:text-[#d1d4dc]'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
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
        </div>
      </div>

      {/* Content Area */}
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
                  <th className="px-4 py-2 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e8ea] dark:divide-[#2a2e39]/50">
                {posList.map(p => {
                  const currentPrice = p.symbol === currentStock.symbol ? currentStock.price : (STOCKS.find(s => s.symbol === p.symbol)?.price || p.averagePrice);
                  const margin = (p.averagePrice * p.quantity) / p.leverage;
                  const pnl = p.side === 'LONG' ? (currentPrice - p.averagePrice) * p.quantity : (p.averagePrice - currentPrice) * p.quantity;
                  const roe = margin > 0 ? (pnl / margin) * 100 : 0;
                  
                  return (
                    <tr key={p.symbol} className="hover:bg-[#f5f5f5] dark:hover:bg-[#1e222d] transition-colors">
                      <td className="px-4 py-2 font-bold">{p.symbol}</td>
                      <td className="px-4 py-2">{p.quantity.toLocaleString('vi-VN')}</td>
                      <td className="px-4 py-2">{p.averagePrice.toLocaleString('vi-VN')}</td>
                      <td className="px-4 py-2">{currentPrice.toLocaleString('vi-VN')}</td>
                      <td className="px-4 py-2">{margin.toLocaleString('vi-VN', { maximumFractionDigits: 0 })}</td>
                      <td className={`px-4 py-2 font-bold ${p.side === 'LONG' ? 'text-[#089981]' : 'text-[#f23645]'}`}>{p.side} x{p.leverage}</td>
                      <td className={`px-4 py-2 text-right font-mono font-bold ${pnl >= 0 ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                        {pnl >= 0 ? '+' : ''}{pnl.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} 
                        <span className="text-[10px] ml-1">({pnl >= 0 ? '+' : ''}{roe.toFixed(2)}%)</span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button 
                          onClick={() => onClosePosition && onClosePosition(p.symbol)}
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

        {activeTab === 'trade_history' && (
          <table className="w-full text-left text-xs text-[#1e2329] dark:text-[#d1d4dc]">
            <thead className="sticky top-0 bg-[#f8f9fa] dark:bg-[#0b0e11] text-[#787b86] font-normal text-[11px] border-b border-[#e6e8ea] dark:border-transparent">
              <tr>
                <th className="px-4 py-2">Thời gian</th>
                <th className="px-4 py-2">Loại</th>
                <th className="px-4 py-2">Chi tiết</th>
                <th className="px-4 py-2 text-right">Biến động (VND)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6e8ea] dark:divide-[#2a2e39]/50">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-[#787b86]">Không có giao dịch nào</td>
                </tr>
              ) : (
                transactions.map(tx => {
                  const isPositive = tx.type === 'SELL_STOCK' || tx.type === 'DEPOSIT';
                  const colorClass = isPositive ? 'text-[#089981]' : 'text-[#f23645]';
                  const sign = isPositive ? '+' : '-';
                  return (
                    <tr key={tx._id} className="hover:bg-[#f5f5f5] dark:hover:bg-[#1e222d] transition-colors">
                      <td className="px-4 py-2 text-[#787b86]">
                        {new Date(tx.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.type.includes('BUY') ? 'bg-[#f23645]/20 text-[#f23645]' : 
                          tx.type.includes('SELL') ? 'bg-[#089981]/20 text-[#089981]' : 
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {tx.type.replace('_STOCK', '')}
                        </span>
                      </td>
                      <td className="px-4 py-2">{tx.description}</td>
                      <td className={`px-4 py-2 text-right font-mono font-semibold ${colorClass}`}>
                        {sign}{tx.amount.toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}

        {/* Other empty tabs */}
        {['open_orders', 'order_history', 'position_history', 'fund_flow'].includes(activeTab) && (
          <EmptyState />
        )}
      </div>
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
