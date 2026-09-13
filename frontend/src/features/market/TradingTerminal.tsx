import { useState, useEffect } from 'react';
import { ChartArea } from './components/ChartArea';
import { RightSidebar } from './components/RightSidebar';
import { LeftToolbar } from './components/LeftToolbar';
import { ToolbarNavbar } from '../../components/ToolbarNavbar';
import { TransactionHistory } from './components/TransactionHistory';
import { STOCKS, type Stock } from './data';
import { tradingApi } from '../../services/tradingApi';

export interface TradeOrder {
  id: string;
  type: 'buy' | 'sell';
  symbol: string;
  price: number;
  qty: number;
  timestamp: number;
  tp?: number;
  sl?: number;
}

export const TradingTerminal = () => {
  const [activeTool, setActiveTool] = useState<string>('cursor');
  const [selectedStock, setSelectedStock] = useState<Stock>(STOCKS[0]);
  const [tradeOrders, setTradeOrders] = useState<TradeOrder[]>([]);
  const [activeTimeframe, setActiveTimeframe] = useState<string>('D');
  const [balance, setBalance] = useState<number>(100_000_000);
  const [positions, setPositions] = useState<Record<string, { quantity: number, averagePrice: number, side: 'LONG'|'SHORT', leverage: number, tp?: number, sl?: number }>>({});
  const [tradeCount, setTradeCount] = useState(0);

  // Bar Replay state
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayIndex, setReplayIndex] = useState(0);

  const handleToolClick = (toolName: string) => {
    setActiveTool(toolName === activeTool && toolName !== 'cursor' ? activeTool : toolName);
  };

  const handleStockSelect = (stock: Stock) => {
    setSelectedStock(stock);
    if (isReplaying) {
      setIsReplaying(false);
      setReplayIndex(0);
    }
  };

  const handlePriceChange = (newPrice: number) => {
    setSelectedStock(prev => prev.price === newPrice ? prev : { ...prev, price: newPrice });
  };

  const fetchPortfolio = async () => {
    try {
      const res = await tradingApi.getPortfolio();
      if (res.success && res.data) {
        if (res.data.wallet) {
           setBalance(res.data.wallet.availableBalance);
        }
        if (res.data.holdings) {
           const newPositions: Record<string, { quantity: number, averagePrice: number, side: 'LONG'|'SHORT', leverage: number, tp?: number, sl?: number }> = {};
           res.data.holdings.forEach((h: any) => {
             newPositions[h.symbol] = { quantity: h.quantity, averagePrice: h.averagePrice, side: h.side, leverage: h.leverage, tp: h.tp, sl: h.sl };
           });
           setPositions(newPositions);
        }
      }
    } catch (e) {
      console.error('Failed to fetch portfolio', e);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handleTrade = async (type: 'buy' | 'sell' | 'close', price: number, margin: number, leverage: number, tp?: number, sl?: number) => {
    try {
      if (type === 'close') {
         const pos = positions[selectedStock.symbol];
         if (!pos) return { success: false, message: 'Không có vị thế để đóng' };
         
         const res = await tradingApi.closePosition(selectedStock.symbol, pos.side, price);
         if (res.success) {
            await fetchPortfolio();
            setTradeCount(c => c + 1);
            return { success: true, message: `✅ Đã chốt vị thế ${pos.side} thành công` };
         }
      } else if (type === 'buy') {
        const res = await tradingApi.buyStock(selectedStock.symbol, margin, leverage, price, sl, tp);
        if (res.success) {
           await fetchPortfolio();
           const order: TradeOrder = {
             id: `${Date.now()}-${Math.random()}`,
             type, symbol: selectedStock.symbol, price, qty: (margin*leverage)/price, timestamp: Date.now(), tp, sl,
           };
           setTradeOrders(prev => [...prev, order]);
           setTradeCount(c => c + 1);
           return { success: true, message: `✅ Mở LONG ${selectedStock.symbol} thành công` };
        }
      } else if (type === 'sell') {
        const res = await tradingApi.sellStock(selectedStock.symbol, margin, leverage, price);
        if (res.success) {
           await fetchPortfolio();
           const order: TradeOrder = {
             id: `${Date.now()}-${Math.random()}`,
             type, symbol: selectedStock.symbol, price, qty: (margin*leverage)/price, timestamp: Date.now(), tp, sl,
           };
           setTradeOrders(prev => [...prev, order]);
           setTradeCount(c => c + 1);
           return { success: true, message: `✅ Mở SHORT ${selectedStock.symbol} thành công` };
        }
      }
    } catch (error: any) {
       return { success: false, message: error.message || 'Giao dịch thất bại' };
    }
    return { success: false, message: 'Lỗi không xác định' };
  };

  const handleUpdateTPSL = async (tp?: number, sl?: number) => {
    try {
      const pos = positions[selectedStock.symbol];
      if (!pos) return { success: false, message: 'Không có vị thế' };
      
      const res = await tradingApi.updateTPSL(selectedStock.symbol, pos.side, tp, sl);
      if (res.success) {
         await fetchPortfolio();
         return { success: true, message: `✅ Đã cập nhật TP/SL` };
      }
      return { success: false, message: 'Lỗi cập nhật' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Lỗi hệ thống' };
    }
  };

  const handleAddMargin = async (amount: number) => {
    try {
      const pos = positions[selectedStock.symbol];
      if (!pos) return { success: false, message: 'Không có vị thế' };
      
      const res = await tradingApi.addMargin(selectedStock.symbol, pos.side, amount);
      if (res.success) {
         await fetchPortfolio();
         return { success: true, message: res.message || `✅ Đã bơm thêm ký quỹ` };
      }
      return { success: false, message: res.message || 'Lỗi bơm ký quỹ' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Lỗi hệ thống' };
    }
  };

  // Auto Close on TP / SL / LIQUIDATION
  useEffect(() => {
    const pos = positions[selectedStock.symbol];
    if (!pos) return;

    const currentPrice = selectedStock.price;
    const actualMargin = (pos.averagePrice * pos.quantity) / pos.leverage;
    let pnl = 0;
    let shouldClose = false;
    let reason = '';

    if (pos.side === 'LONG') {
      pnl = (currentPrice - pos.averagePrice) * pos.quantity;
      if (pos.sl && currentPrice <= pos.sl) { shouldClose = true; reason = 'Chạm Cắt Lỗ (SL)'; }
      if (pos.tp && currentPrice >= pos.tp) { shouldClose = true; reason = 'Chạm Chốt Lời (TP)'; }
    } else if (pos.side === 'SHORT') {
      pnl = (pos.averagePrice - currentPrice) * pos.quantity;
      if (pos.sl && currentPrice >= pos.sl) { shouldClose = true; reason = 'Chạm Cắt Lỗ (SL)'; }
      if (pos.tp && currentPrice <= pos.tp) { shouldClose = true; reason = 'Chạm Chốt Lời (TP)'; }
    }

    // Liquidation Check
    if (pnl <= -actualMargin) {
      shouldClose = true;
      reason = 'Thanh lý (Cháy tài khoản)';
    }

    if (shouldClose) {
      const key = `${selectedStock.symbol}_${pos.side}`;
      if ((window as any)[`isClosing_${key}`]) return;
      (window as any)[`isClosing_${key}`] = true;

      handleTrade('close', currentPrice, 0, 0).then(res => {
         (window as any)[`isClosing_${key}`] = false;
         if (res.success) {
           alert(`⚠️ HỆ THỐNG TỰ ĐỘNG ĐÓNG VỊ THẾ!\nLý do: ${reason}\nGiá thực thi: ${currentPrice.toLocaleString('vi-VN')}₫`);
         }
      }).catch(() => {
         (window as any)[`isClosing_${key}`] = false;
      });
    }
  }, [selectedStock.price, positions, selectedStock.symbol]);

  const handleStartReplay = (fromIndex: number) => {
    setReplayIndex(fromIndex);
    setIsReplaying(true);
  };

  const handleReplayNext = () => {
    setReplayIndex(i => i + 1);
  };

  const handleStopReplay = () => {
    setIsReplaying(false);
    setReplayIndex(0);
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <ToolbarNavbar
        selectedStock={selectedStock}
        activeTimeframe={activeTimeframe}
        onTimeframeChange={setActiveTimeframe}
        balance={balance}
        isReplaying={isReplaying}
        replayIndex={replayIndex}
        onStartReplay={handleStartReplay}
        onReplayNext={handleReplayNext}
        onStopReplay={handleStopReplay}
      />
      <div className="flex flex-1 overflow-hidden">
        <LeftToolbar activeTool={activeTool} onToolClick={handleToolClick} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <ChartArea
            activeTool={activeTool}
            selectedStock={selectedStock}
            activeTimeframe={activeTimeframe}
            isReplaying={isReplaying}
            replayIndex={replayIndex}
            tradeOrders={tradeOrders.filter(o => o.symbol === selectedStock.symbol)}
            activePosition={positions[selectedStock.symbol]}
            onPriceChange={handlePriceChange}
          />
          <TransactionHistory refreshTrigger={tradeCount} />
        </div>
        <RightSidebar
          selectedStock={selectedStock}
          positions={positions as any}
          balance={balance}
          onStockSelect={handleStockSelect}
          onTrade={handleTrade}
          onUpdateTPSL={handleUpdateTPSL}
          onAddMargin={handleAddMargin}
        />
      </div>
    </div>
  );
};
