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
    
    // BottomPanel
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
