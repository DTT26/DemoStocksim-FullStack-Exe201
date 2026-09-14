import { useState, useEffect } from 'react';
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
  refreshTrigger
}: BottomPanelProps) => {
  const [activeTab, setActiveTab] = useState<'positions' | 'orders' | 'history'>('positions');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (activeTab === 'history') {
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

  const posList = Object.entries(positions).map(([symbol, pos]) => {
    const isSelected = symbol === selectedSymbol;
    const price = isSelected ? currentPrice : (STOCKS.find(s => s.symbol === symbol)?.price || 0);
    
    let pnl = 0;
    if (pos.side === 'LONG') {
      pnl = (price - pos.averagePrice) * pos.quantity;
    } else {
      pnl = (pos.averagePrice - price) * pos.quantity;
    }
    const margin = (pos.averagePrice * pos.quantity) / pos.leverage;
    const pnlPercent = (pnl / margin) * 100;
    const pnlColor = pnl >= 0 ? 'text-[#089981]' : 'text-[#f23645]';
    const pnlSign = pnl >= 0 ? '+' : '';

    return { symbol, ...pos, price, pnl, pnlPercent, pnlColor, pnlSign, margin };
  });

  return (
    <div className="h-64 border-t border-[#2a2e39] bg-[#131722] flex flex-col shrink-0 overflow-hidden text-xs text-[#d1d4dc]">
      <div className="flex border-b border-[#2a2e39] px-2 pt-2 gap-4">
        <button
          onClick={() => setActiveTab('positions')}
          className={`pb-2 px-2 font-semibold transition-colors ${activeTab === 'positions' ? 'text-white border-b-2 border-blue-500' : 'text-[#787b86] hover:text-[#d1d4dc]'}`}
        >
          Vị thế ({posList.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-2 px-2 font-semibold transition-colors ${activeTab === 'orders' ? 'text-white border-b-2 border-blue-500' : 'text-[#787b86] hover:text-[#d1d4dc]'}`}
        >
          Lệnh mở ({pendingOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-2 px-2 font-semibold transition-colors ${activeTab === 'history' ? 'text-white border-b-2 border-blue-500' : 'text-[#787b86] hover:text-[#d1d4dc]'}`}
        >
          Lịch sử giao dịch
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'positions' && (
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-[#131722] text-[#787b86] font-medium border-b border-[#2a2e39]">
              <tr>
                <th className="px-4 py-2 font-medium">Mã</th>
                <th className="px-4 py-2 font-medium">Size</th>
                <th className="px-4 py-2 font-medium">Giá vào</th>
                <th className="px-4 py-2 font-medium">Giá hiện tại</th>
                <th className="px-4 py-2 font-medium">Ký quỹ (Margin)</th>
                <th className="px-4 py-2 font-medium">PNL (ROE%)</th>
                <th className="px-4 py-2 font-medium">TP/SL</th>
                <th className="px-4 py-2 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e39]/50">
              {posList.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-[#787b86]">Không có vị thế nào</td></tr>
              ) : (
                posList.map(pos => (
                  <tr key={pos.symbol} className="hover:bg-[#1e222d] transition-colors">
                    <td className="px-4 py-2">
                      <span className="font-bold text-white mr-2">{pos.symbol}</span>
                      <span className={`font-bold ${pos.side === 'LONG' ? 'text-green-500' : 'text-red-500'}`}>{pos.side} {pos.leverage}x</span>
                    </td>
                    <td className="px-4 py-2 font-mono">{pos.quantity.toFixed(2)}</td>
                    <td className="px-4 py-2 font-mono">{pos.averagePrice.toLocaleString('vi-VN')}</td>
                    <td className="px-4 py-2 font-mono">{pos.price.toLocaleString('vi-VN')}</td>
                    <td className="px-4 py-2 font-mono">
                      {pos.margin.toLocaleString('vi-VN')}
                      <button onClick={async () => {
                        const ans = window.prompt(`Nhập số tiền VNĐ muốn bơm thêm vào ${pos.symbol}:`);
                        if (!ans) return;
                        const amount = parseInt(ans, 10);
                        if (!isNaN(amount) && amount > 0) {
                          const res = await onAddMargin(pos.symbol, pos.side, amount);
                          alert(res.message);
                        }
                      }} className="ml-2 text-blue-400 hover:text-blue-300">+</button>
                    </td>
                    <td className={`px-4 py-2 font-mono font-semibold ${pos.pnlColor}`}>
                      {pos.pnlSign}{pos.pnl.toLocaleString('vi-VN')} ({pos.pnlSign}{pos.pnlPercent.toFixed(2)}%)
                    </td>
                    <td className="px-4 py-2 font-mono text-[#787b86]">
                      {pos.tp || '-'} / {pos.sl || '-'}
                      <button onClick={async () => {
                        const newTp = window.prompt(`Nhập giá Chốt lời (TP) cho ${pos.symbol}:`, pos.tp?.toString() || '');
                        const newSl = window.prompt(`Nhập giá Cắt lỗ (SL) cho ${pos.symbol}:`, pos.sl?.toString() || '');
                        if (newTp !== null && newSl !== null) {
                           const res = await onUpdateTPSL(pos.symbol, pos.side, parseFloat(newTp) || undefined, parseFloat(newSl) || undefined);
                           alert(res.message);
                        }
                      }} className="ml-2 text-blue-400 hover:text-blue-300">Sửa</button>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button onClick={async () => {
                        const res = await onClosePosition(pos.symbol, pos.side, pos.price);
                        alert(res.message);
                      }} className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-white transition-colors">Đóng</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'orders' && (
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-[#131722] text-[#787b86] font-medium border-b border-[#2a2e39]">
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

        {activeTab === 'history' && (
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-[#131722] text-[#787b86] font-medium border-b border-[#2a2e39]">
              <tr>
                <th className="px-4 py-2 font-medium">Thời gian</th>
                <th className="px-4 py-2 font-medium">Loại</th>
                <th className="px-4 py-2 font-medium">Chi tiết</th>
                <th className="px-4 py-2 font-medium text-right">Biến động (VND)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e39]/50">
              {transactions.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-[#787b86]">Không có giao dịch nào</td></tr>
              ) : (
                transactions.map(tx => {
                  const isPositive = tx.type === 'SELL_STOCK' || tx.type === 'DEPOSIT';
                  const colorClass = isPositive ? 'text-[#089981]' : 'text-[#f23645]';
                  return (
                    <tr key={tx._id} className="hover:bg-[#1e222d] transition-colors">
                      <td className="px-4 py-2 text-[#787b86]">{new Date(tx.createdAt).toLocaleString('vi-VN')}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.type.includes('BUY') ? 'bg-[#f23645]/20 text-[#f23645]' : 
                          tx.type.includes('SELL') ? 'bg-[#089981]/20 text-[#089981]' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {tx.type.replace('_STOCK', '')}
                        </span>
                      </td>
                      <td className="px-4 py-2">{tx.description}</td>
                      <td className={`px-4 py-2 text-right font-mono font-semibold ${colorClass}`}>
                        {isPositive ? '+' : '-'}{Math.abs(tx.amount).toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
