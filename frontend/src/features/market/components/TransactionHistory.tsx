import { useEffect, useState } from 'react';
import { tradingApi } from '../../../services/tradingApi';

interface Transaction {
  _id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
}

export const TransactionHistory = ({ refreshTrigger }: { refreshTrigger: number }) => {
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

  return (
    <div className="h-64 border-t border-[#2a2e39] bg-[#131722] flex flex-col shrink-0 overflow-hidden">
      <div className="px-4 py-2 border-b border-[#2a2e39] font-semibold text-[#d1d4dc] text-sm">
        Lịch sử Giao dịch
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full text-left text-xs text-[#d1d4dc]">
          <thead className="sticky top-0 bg-[#131722] text-[#787b86] uppercase tracking-wider text-[10px] shadow-sm">
            <tr>
              <th className="px-4 py-2 font-medium">Thời gian</th>
              <th className="px-4 py-2 font-medium">Loại</th>
              <th className="px-4 py-2 font-medium">Chi tiết</th>
              <th className="px-4 py-2 font-medium text-right">Biến động ($)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2e39]/50">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[#787b86]">Không có giao dịch nào</td>
              </tr>
            ) : (
              transactions.map(tx => {
                // Trong Margin Trading: Mở lệnh (Buy/Sell) đều là trừ tiền ký quỹ -> Âm
                // Đóng lệnh (Deposit) là trả lại tiền ký quỹ + lãi/lỗ -> Dương
                const isPositive = tx.type === 'DEPOSIT';
                const colorClass = isPositive ? 'text-[#089981]' : 'text-[#f23645]';
                const sign = isPositive ? '+' : '-';
                
                return (
                  <tr key={tx._id} className="hover:bg-[#1e222d] transition-colors">
                    <td className="px-4 py-2 text-[#787b86]">
                      {new Date(tx.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.type === 'DEPOSIT' ? 'bg-blue-500/20 text-blue-400' :
                        tx.type.includes('BUY') ? 'bg-[#089981]/20 text-[#089981]' :
                        'bg-[#f23645]/20 text-[#f23645]'
                      }`}>
                        {tx.type === 'DEPOSIT' ? 'CLOSE' : tx.type.replace('_STOCK', '')}
                      </span>
                    </td>
                    <td className="px-4 py-2">{tx.description}</td>
                    <td className={`px-4 py-2 text-right font-mono font-semibold ${colorClass}`}>
                      {sign}{Math.abs(tx.amount).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
