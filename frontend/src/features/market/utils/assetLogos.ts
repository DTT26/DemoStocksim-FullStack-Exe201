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
  OKX: {
    label: 'OKX',
    shortLabel: 'OKX',
    color: '#ffffff',
    bg: '#000000',
  },
  'OKX FUTURES': {
    label: 'OKX FUT',
    shortLabel: 'OKF',
    color: '#ffffff',
    bg: '#000000',
  },
  BYBIT: {
    label: 'BYBIT',
    shortLabel: 'BYB',
    color: '#111111',
    bg: '#f7a600',
  },
  'BYBIT FUTURES': {
    label: 'BYBIT FUT',
    shortLabel: 'BYF',
    color: '#111111',
    bg: '#f7a600',
  },
  COINBASE: {
    label: 'COINBASE',
    shortLabel: 'COI',
    color: '#ffffff',
    bg: '#0052ff',
  },
  NASDAQ: {
    label: 'NASDAQ',
    shortLabel: 'NDQ',
    color: '#ffffff',
    bg: '#093a7c',
  },
  CME: {
    label: 'CME',
    shortLabel: 'CME',
    color: '#ffffff',
    bg: '#005b9f',
  },
  CBOT: {
    label: 'CBOT',
    shortLabel: 'CBO',
    color: '#ffffff',
    bg: '#005b9f',
  },
  NYMEX: {
    label: 'NYMEX',
    shortLabel: 'NYM',
    color: '#ffffff',
    bg: '#005b9f',
  },
  OANDA: {
    label: 'OANDA',
    shortLabel: 'OA',
    color: '#ffffff',
    bg: '#00a550',
  },
  NYSE: {
    label: 'NYSE',
    shortLabel: 'NYS',
    color: '#ffffff',
    bg: '#195f9c',
  },
  KRAKEN: {
    label: 'KRAKEN',
    shortLabel: 'KRK',
    color: '#ffffff',
    bg: '#5741d9',
  },
  KUCOIN: {
    label: 'KUCOIN',
    shortLabel: 'KUC',
    color: '#ffffff',
    bg: '#24a182',
  },
  HTX: {
    label: 'HTX',
    shortLabel: 'HTX',
    color: '#ffffff',
    bg: '#004de6',
  },
  'FOREX.COM': {
    label: 'FOREX.COM',
    shortLabel: 'FOR',
    color: '#ffffff',
    bg: '#00502f',
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

/** Map logo riêng cho các Crypto mới chưa có trong CDN chuẩn */
const CRYPTO_LOGOS: Record<string, string> = {
  MATIC: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
  LDO: 'https://cryptologos.cc/logos/lido-dao-ldo-logo.png',
  TRX: 'https://cryptologos.cc/logos/tron-trx-logo.png',
  SHIB: 'https://cryptologos.cc/logos/shiba-inu-shib-logo.png',
  PEPE: 'https://cryptologos.cc/logos/pepe-pepe-logo.png',
  AVAX: 'https://cryptologos.cc/logos/avalanche-avax-logo.png',
  DOT: 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png',
};

export const getCoinLogoUrl = (symbol: string): string => {
  const cleaned = symbol
    .replace(/\.P$/i, '')        // bỏ .P (futures)
    .replace(/\.SWAP$/i, '')     // bỏ .SWAP
    .replace(/USDT$/i, '')       // bỏ USDT
    .replace(/BUSD$/i, '')       // bỏ BUSD
    .replace(/USD$/i, '')        // bỏ USD
    .replace(/^1000/i, '')       // bỏ prefix 1000
    .toUpperCase();

  if (CRYPTO_LOGOS[cleaned]) {
    return CRYPTO_LOGOS[cleaned];
  }

  return `https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/${cleaned.toLowerCase()}.png`;
};


/** Màu cho hàng hóa / forex */
const COMMODITY_COLORS: Record<string, { bg: string; color: string; emoji?: string }> = {
  XAUUSD: { bg: '#b8860b', color: '#ffffff', emoji: '🥇' },
  XAGUSD: { bg: '#708090', color: '#ffffff', emoji: '🥈' },
  USOIL: { bg: '#333333', color: '#ffffff', emoji: '🛢️' },
  EURUSD: { bg: '#003087', color: '#ffffff', emoji: '💱' },
  GBPUSD: { bg: '#012169', color: '#ffffff', emoji: '💷' },
  USDJPY: { bg: '#bc002d', color: '#ffffff', emoji: '💹' },
  AUDUSD: { bg: '#00008b', color: '#ffffff', emoji: '🦘' },
  USDCAD: { bg: '#c8102e', color: '#ffffff', emoji: '🍁' },
};

/** Màu avatar cho cổ phiếu Mỹ */
const US_STOCK_COLORS: Record<string, { bg: string; color: string; logoUrl?: string }> = {
  AAPL: { bg: '#555555', color: '#ffffff', logoUrl: 'https://financialmodelingprep.com/image-stock/AAPL.png' },
  MSFT: { bg: '#00a4ef', color: '#ffffff', logoUrl: 'https://financialmodelingprep.com/image-stock/MSFT.png' },
  TSLA: { bg: '#e23d28', color: '#ffffff', logoUrl: 'https://financialmodelingprep.com/image-stock/TSLA.png' },
  NVDA: { bg: '#76b900', color: '#ffffff', logoUrl: 'https://financialmodelingprep.com/image-stock/NVDA.png' },
  KO: { bg: '#f40009', color: '#ffffff', logoUrl: 'https://financialmodelingprep.com/image-stock/KO.png' },
  JNJ: { bg: '#d51900', color: '#ffffff', logoUrl: 'https://financialmodelingprep.com/image-stock/JNJ.png' },
};

/** Màu avatar cho Chỉ số */
const INDEX_COLORS: Record<string, { bg: string; color: string; emoji?: string; logoUrl?: string }> = {
  SPX: { bg: '#093a7c', color: '#ffffff', logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://spglobal.com&size=128' },
  NDX: { bg: '#005b9f', color: '#ffffff', logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://nasdaq.com&size=128' },
  DJI: { bg: '#1a1a1a', color: '#ffffff', logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://dowjones.com&size=128' },
};

export interface AssetStyle {
  bg: string;
  color: string;
  text: string;       // text to show inside avatar
  emoji?: string;
  isCrypto: boolean;
  coinLogoUrl?: string;
  logoUrl?: string;
}

/** Tính toán style đầy đủ cho 1 asset symbol */
export const getAssetStyle = (symbol: string, market: string): AssetStyle => {
  const cleanSymbol = symbol
    .replace(/\.P$/i, '')
    .replace(/\.SWAP$/i, '')
    .replace(/USDT$/i, '')
    .replace(/BUSD$/i, '')
    .replace(/USD$/i, '')
    .replace(/^1000/i, '')
    .toUpperCase();

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

  // Chỉ số
  const indexStyle = INDEX_COLORS[cleanSymbol];
  if (indexStyle) {
    return {
      ...indexStyle,
      text: cleanSymbol.slice(0, 3),
      isCrypto: false,
    };
  }


  // Cổ phiếu Mỹ
  const usStyle = US_STOCK_COLORS[cleanSymbol];
  if (usStyle) {
    return {
      ...usStyle,
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
