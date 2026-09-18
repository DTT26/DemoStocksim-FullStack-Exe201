/**
 * Utility functions để lấy logo URL và màu sắc cho từng sàn giao dịch & coin
 */

export interface ExchangeConfig {
  label: string;
  shortLabel: string;
  color: string;        // text color
  bg: string;           // background color
  logoUrl?: string;     // optional remote logo
}

/** Cấu hình màu sắc & logo cho từng sàn */
export const EXCHANGE_CONFIGS: Record<string, ExchangeConfig> = {
  HOSE: {
    label: 'HOSE',
    shortLabel: 'HO',
    color: '#ffffff',
    bg: '#c0392b',
  },
  HNX: {
    label: 'HNX',
    shortLabel: 'HN',
    color: '#ffffff',
    bg: '#2980b9',
  },
  BINANCE: {
    label: 'BINANCE',
    shortLabel: 'BNB',
    color: '#1a1a1a',
    bg: '#F0B90B',
    logoUrl: 'https://bin.bnbstatic.com/image/pgc/202309/b63cc5b4bd2b7a9f5b59d3fcceb8d46d.png',
  },
  'BINANCE FUTURES': {
    label: 'FUTURES',
    shortLabel: 'FUT',
    color: '#1a1a1a',
    bg: '#F0B90B',
    logoUrl: 'https://bin.bnbstatic.com/image/pgc/202309/b63cc5b4bd2b7a9f5b59d3fcceb8d46d.png',
  },
  OANDA: {
    label: 'OANDA',
    shortLabel: 'OA',
    color: '#ffffff',
    bg: '#00a550',
  },
};

/** Lấy cấu hình sàn (fallback nếu không tìm thấy) */
export const getExchangeConfig = (exchange: string): ExchangeConfig => {
  return (
    EXCHANGE_CONFIGS[exchange.toUpperCase()] ?? {
      label: exchange,
      shortLabel: exchange.slice(0, 2).toUpperCase(),
      color: '#ffffff',
      bg: '#4a4a6a',
    }
  );
};

/**
 * Trả về URL logo coin từ CDN cryptocurrency-icons (spothq).
 * Hỗ trợ: BTC, ETH, BNB, SOL, XRP, ADA, ...
 * Symbol có thể là: BTCUSDT, BTCUSDT.P, BTC
 */
export const getCoinLogoUrl = (symbol: string): string => {
  const cleaned = symbol
    .replace(/\.P$/i, '')        // bỏ .P (futures)
    .replace(/USDT$/i, '')       // bỏ USDT
    .replace(/BUSD$/i, '')       // bỏ BUSD
    .replace(/USD$/i, '')        // bỏ USD
    .toLowerCase();

  return `https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/${cleaned}.png`;
};

/** Màu avatar cho cổ phiếu VN theo tên công ty */
const VN_STOCK_COLORS: Record<string, { bg: string; color: string }> = {
  FPT: { bg: '#ff6f00', color: '#ffffff' },
  VCB: { bg: '#006633', color: '#ffffff' },
  HPG: { bg: '#c0392b', color: '#ffffff' },
  SSI: { bg: '#1565c0', color: '#ffffff' },
  VIC: { bg: '#6a1b9a', color: '#ffffff' },
  VHM: { bg: '#0277bd', color: '#ffffff' },
  MSN: { bg: '#e65100', color: '#ffffff' },
};

/** Màu cho hàng hóa / forex */
const COMMODITY_COLORS: Record<string, { bg: string; color: string; emoji?: string }> = {
  XAUUSD: { bg: '#b8860b', color: '#ffffff', emoji: '🥇' },
  XAGUSD: { bg: '#708090', color: '#ffffff', emoji: '🥈' },
  EURUSD: { bg: '#003087', color: '#ffffff', emoji: '💱' },
  GBPUSD: { bg: '#012169', color: '#ffffff', emoji: '💷' },
  USDJPY: { bg: '#bc002d', color: '#ffffff', emoji: '💹' },
};

export interface AssetStyle {
  bg: string;
  color: string;
  text: string;       // text to show inside avatar
  emoji?: string;
  isCrypto: boolean;
  coinLogoUrl?: string;
}

/** Tính toán style đầy đủ cho 1 asset symbol */
export const getAssetStyle = (symbol: string, market: string): AssetStyle => {
  const cleanSymbol = symbol.replace(/\.P$/i, '').replace(/USDT$/i, '').toUpperCase();

  // Crypto
  if (market === 'Tiền điện tử (Crypto)') {
    return {
      bg: '#1a1a2e',
      color: '#F0B90B',
      text: cleanSymbol.slice(0, 3),
      isCrypto: true,
      coinLogoUrl: getCoinLogoUrl(symbol),
    };
  }

  // Hàng hóa / Forex
  const commodityStyle = COMMODITY_COLORS[symbol.toUpperCase()];
  if (commodityStyle) {
    return {
      ...commodityStyle,
      text: cleanSymbol.slice(0, 2),
      isCrypto: false,
    };
  }

  // Cổ phiếu VN
  const vnStyle = VN_STOCK_COLORS[cleanSymbol];
  if (vnStyle) {
    return {
      ...vnStyle,
      text: cleanSymbol.slice(0, 3),
      isCrypto: false,
    };
  }

  // Fallback
  return {
    bg: '#2a2e39',
    color: '#d1d4dc',
    text: cleanSymbol.slice(0, 3),
    isCrypto: false,
  };
};
