import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type Language = 'vi' | 'en';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  vi: {
    // Navigation / General
    'nav.trade': 'Giao dịch',
    'nav.portfolio': 'Tài sản',
    'nav.history': 'Lịch sử',
    'nav.challenge': 'Thử Thách Quỹ',
    'nav.challengeTitle': 'Thử Thách Cấp Vốn Quỹ',
    'nav.level1': 'Cấp 1',
    'nav.phaseBadge': 'Cấp',
    'nav.accountRank': 'Hạng tài khoản:',
    'lang.vi': 'Tiếng Việt',
    'lang.en': 'English',
    
    // RightSidebar
    'order.buy': 'Mua',
    'order.sell': 'Bán',
    'order.market': 'Thị trường',
    'order.limit': 'Giới hạn',
    'order.stop': 'Dừng',
    'order.price': 'Giá',
    'order.qty': 'Khối lượng',
    'order.stock': 'Cổ phiếu',
    'order.contract': 'Hợp đồng',
    'order.balance': 'Số dư',
    'order.margin': 'Ký quỹ',
    'order.leverage': 'Đòn bẩy',
    'order.takeProfit': 'Chốt lời',
    'order.stopLoss': 'Cắt lỗ',
    'order.setupTPSL': 'Thiết lập Chốt lời / Cắt lỗ (TP/SL)',
    'order.btnBuy': 'MUA / LONG',
    'order.btnSell': 'BÁN / SHORT',
    'order.positionValue': 'Giá trị vị thế',
    'order.requiredMargin': 'Ký quỹ yêu cầu',
    'order.actualQty': 'Khối lượng thực tế',
    'order.ratioRR': 'Tỷ lệ R:R (Lợi nhuận/Rủi ro)',
    'order.orderSize': 'Quy mô lệnh',
    'order.amount': 'Số tiền',
    'order.percentBalance': '% số dư',
    'order.estQty': 'Khối lượng dự kiến:',
    'order.marginUsed': 'Dùng vốn (Ký quỹ):',
    'order.tradingMode': 'Chế độ giao dịch',
    'order.spotMode': 'Spot (1X · Không đòn bẩy)',
    'order.restore': 'Khôi phục',
    'order.restoreDesc': '⚠️ Tổng tài sản còn dưới $5,000 USD! Bạn có thể khôi phục lại $100,000 USD (Tối đa 1 lần/ngày, 4 lần/tuần).',
    // Watchlist & Panels
    'watchlist.myList': 'Danh sách của tôi',
    'watchlist.symbol': 'Mã giao dịch',
    'watchlist.price': 'Giá',
    'watchlist.change': 'Thay đổi',
    'market.crypto': 'Tiền điện tử (Crypto)',
    'sim.title': 'Mô phỏng Giao dịch',
    'sim.running': 'Đang chạy',
    'sim.completed': 'Đã xong',
    'sim.startNew': 'BẮT ĐẦU PHIÊN MỚI',
    
    // TickerHeader
    'header.markPrice': 'Giá đánh dấu',
    'header.indexPrice': 'Giá chỉ số',
    'header.24hHigh': 'Cao nhất 24 giờ',
    'header.24hLow': 'Thấp nhất 24 giờ',
    'header.24hVol': 'KL 24h',
    'header.funding': 'Tài trợ (8h)',
    'tab.chart': 'Biểu đồ',
    'tab.coinInfo': 'Thông Tin Coin',
    'tab.stockInfo': 'Thông Tin Cổ phiếu',
    'tab.info': 'Thông tin',
    'tab.timeframe': 'Khoảng thời gian',
    
    // BottomPanel
    'panel.positions': 'Vị thế',
    'panel.orders': 'Lệnh chờ',
    'panel.positionHistory': 'Lịch sử vị thế',
    'panel.tradeHistory': 'Lịch sử giao dịch',
    'panel.orderHistory': 'Lịch sử đặt lệnh',
    'panel.cashflowHistory': 'Biến động số dư',
    'panel.closeAll': 'Đóng toàn bộ',
    'table.symbol': 'Mã',
    'table.size': 'Khối lượng',
    'table.entryPrice': 'Giá mở',
    'table.currentPrice': 'Giá hiện tại',
    'table.margin': 'Margin',
    'table.pnl': 'Lợi nhuận',
    'table.time': 'Thời gian',
    'table.type': 'Loại',
    'table.detail': 'Chi tiết',
    'table.status': 'Trạng thái',
    'table.pnlOnly': 'Lợi nhuận PnL ($)',
    'table.cashflow': 'Biến động ($)',
    'table.aiAnalysis': 'AI Phân Tích',
    'table.noClosedPos': 'Chưa có vị thế nào được đóng',
    'table.noTx': 'Không có giao dịch nào',
    'panel.currentPairOnly': 'Cặp hiện tại',
    'panel.closeAllShort': 'Đóng hết',
    'panel.closeOrder': 'Đóng lệnh',
    'panel.cancelOrder': 'Hủy',
    'table.orderType': 'Loại lệnh',
    'table.orderPrice': 'Giá đặt',
    'table.qty': 'Khối lượng',
    'table.action': 'Thao tác',
    'table.noPendingOrders': 'Không có lệnh chờ nào',
    'panel.typeOpenLong': 'MỞ LONG',
    'panel.typeOpenShort': 'MỞ SHORT',
    'panel.typeClosePos': 'ĐÓNG VỊ THẾ',
    'panel.typeDeposit': 'NẠP / HOÀN TIỀN',
    'panel.typeWithdraw': 'RÚT TIỀN',
    'panel.qtyShort': 'KL',
    'panel.marginShort': 'Ký quỹ',
    'panel.statusOpen': 'Đang mở',
    'panel.statusClosed': 'Đã đóng',
    'panel.refundNote': 'Hoàn gốc+lãi:',
    
    // Journal
    'journal.title': 'Nhật ký Giao dịch',
    'journal.subtitle': 'Session Journal & Notes',
    'journal.perfAnalysis': 'Phân tích Hiệu suất Chi tiết',
    'journal.perfDesc': 'Xem 4 Tab: Overview, Charts, Breakdown, Trades',
    'journal.currentSession': 'Phiên hiện tại:',
    'journal.recentTrades': 'Lệnh gần đây',
    'journal.viewAll': 'Xem tất cả',
    'journal.noTrades': 'Chưa có lệnh nào đóng',
    'journal.noTradesDesc': 'Các lệnh chốt lời/cắt lỗ sẽ hiện ở đây',
    'journal.fullJournalBtn': 'Mở Trading Journal Đầy Đủ',
  },
  en: {
    // Navigation / General
    'nav.trade': 'Trade',
    'nav.portfolio': 'Portfolio',
    'nav.history': 'History',
    'nav.challenge': 'Prop Firm Challenge',
    'nav.challengeTitle': 'Prop Firm Challenge',
    'nav.level1': 'Phase 1',
    'nav.phaseBadge': 'Phase',
    'nav.accountRank': 'Account Rank:',
    'lang.vi': 'Tiếng Việt',
    'lang.en': 'English',
    
    // RightSidebar
    'order.buy': 'Buy',
    'order.sell': 'Sell',
    'order.market': 'Market',
    'order.limit': 'Limit',
    'order.stop': 'Stop',
    'order.price': 'Price',
    'order.qty': 'Quantity',
    'order.stock': 'Stock',
    'order.contract': 'Contract',
    'order.balance': 'Balance',
    'order.margin': 'Margin',
    'order.leverage': 'Leverage',
    'order.takeProfit': 'Take Profit',
    'order.stopLoss': 'Stop Loss',
    'order.setupTPSL': 'Setup Take Profit / Stop Loss (TP/SL)',
    'order.btnBuy': 'BUY / LONG',
    'order.btnSell': 'SELL / SHORT',
    'order.positionValue': 'Position Value',
    'order.requiredMargin': 'Required Margin',
    'order.actualQty': 'Actual Quantity',
    'order.ratioRR': 'R:R Ratio (Risk/Reward)',
    'order.cancelEdit': 'CANCEL EDIT',
    'order.saveUpdate': 'SAVE UPDATE',
    'order.orderSize': 'Order Size',
    'order.amount': 'Amount',
    'order.percentBalance': '% Balance',
    'order.estQty': 'Estimated Qty:',
    'order.marginUsed': 'Margin Used:',
    'order.tradingMode': 'Trading Mode',
    'order.spotMode': 'Spot (1X · No Leverage)',
    'order.restore': 'Restore',
    'order.restoreDesc': '⚠️ Total equity is below $5,000! You can restore $100,000 (Max 1/day, 4/week).',
    // Watchlist & Panels
    'watchlist.myList': 'My Watchlist',
    'watchlist.symbol': 'Symbol',
    'watchlist.price': 'Price',
    'watchlist.change': 'Change',
    'market.crypto': 'Cryptocurrency',
    'sim.title': 'Trading Simulation',
    'sim.running': 'Running',
    'sim.completed': 'Completed',
    'sim.startNew': 'START NEW SESSION',
    
    // TickerHeader
    'header.markPrice': 'Mark Price',
    'header.indexPrice': 'Index Price',
    'header.24hHigh': '24h High',
    'header.24hLow': '24h Low',
    'header.24hVol': '24h Vol',
    'header.funding': 'Funding (8h)',
    'tab.chart': 'Chart',
    'tab.coinInfo': 'Coin Info',
    'tab.stockInfo': 'Stock Info',
    'tab.info': 'Info',
    'tab.timeframe': 'Timeframe',
    
    // BottomPanel
    'panel.orderBook': 'Order Book',
    'panel.trade': 'Trade',
    'panel.positions': 'Positions',
    'panel.orders': 'Pending Orders',
    'panel.positionHistory': 'Position History',
    'panel.tradeHistory': 'Trade History',
    'panel.orderHistory': 'Order History',
    'panel.cashflowHistory': 'Cashflow History',
    'panel.closeAll': 'Close All',
    'table.symbol': 'Symbol',
    'table.size': 'Size',
    'table.entryPrice': 'Entry Price',
    'table.currentPrice': 'Current Price',
    'table.margin': 'Margin',
    'table.pnl': 'PNL',
    'table.time': 'Time',
    'table.type': 'Type',
    'table.detail': 'Detail',
    'table.status': 'Status',
    'table.pnlOnly': 'PnL ($)',
    'table.cashflow': 'Change ($)',
    'table.aiAnalysis': 'AI Review',
    'table.noClosedPos': 'No closed positions yet',
    'table.noTx': 'No transactions',
    'panel.currentPairOnly': 'Current Pair Only',
    'panel.closeAllShort': 'Close',
    'panel.closeOrder': 'Close',
    'panel.cancelOrder': 'Cancel',
    'table.orderType': 'Type',
    'table.orderPrice': 'Price',
    'table.qty': 'Size',
    'table.action': 'Action',
    'table.noPendingOrders': 'No pending orders',
    'panel.typeOpenLong': 'OPEN LONG',
    'panel.typeOpenShort': 'OPEN SHORT',
    'panel.typeClosePos': 'CLOSE POS',
    'panel.typeDeposit': 'DEPOSIT/REFUND',
    'panel.typeWithdraw': 'WITHDRAW',
    'panel.qtyShort': 'Qty',
    'panel.marginShort': 'Margin',
    'panel.statusOpen': 'Open',
    'panel.statusClosed': 'Closed',
    'panel.refundNote': 'Refund+Profit:',
    
    // Journal
    'journal.title': 'Trading Journal',
    'journal.subtitle': 'Session Journal & Notes',
    'journal.perfAnalysis': 'Detailed Performance Analysis',
    'journal.perfDesc': 'View 4 Tabs: Overview, Charts, Breakdown, Trades',
    'journal.currentSession': 'Current Session:',
    'journal.recentTrades': 'Recent Trades',
    'journal.viewAll': 'View All',
    'journal.noTrades': 'No closed trades yet',
    'journal.noTradesDesc': 'Take Profit / Stop Loss trades will appear here',
    'journal.fullJournalBtn': 'Open Full Trading Journal',
  }
};

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Language>('vi');

  useEffect(() => {
    const savedLang = localStorage.getItem('app_lang') as Language;
    if (savedLang && (savedLang === 'vi' || savedLang === 'en')) {
      setLangState(savedLang);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('app_lang', newLang);
  };

  const t = (key: string, fallback?: string): string => {
    return translations[lang]?.[key] || fallback || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
