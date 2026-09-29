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
  BINGX: {
    label: 'BINGX',
    shortLabel: 'BGX',
    color: '#ffffff',
    bg: '#0052ff',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://bingx.com&size=128',
  },
  'BINGX / OANDA': {
    label: 'BINGX / OANDA',
    shortLabel: 'BGX',
    color: '#ffffff',
    bg: '#0052ff',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://oanda.com&size=128',
  },
  'BINGX / NYMEX': {
    label: 'BINGX / NYMEX',
    shortLabel: 'NYM',
    color: '#ffffff',
    bg: '#0052ff',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://cmegroup.com&size=128',
  },
  'BINGX / ICE': {
    label: 'BINGX / ICE',
    shortLabel: 'ICE',
    color: '#ffffff',
    bg: '#002f6c',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://ice.com&size=128',
  },
  'BINGX / COMEX': {
    label: 'BINGX / COMEX',
    shortLabel: 'CMX',
    color: '#ffffff',
    bg: '#005b9f',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://cmegroup.com&size=128',
  },
  'BINGX / FOREX.COM': {
    label: 'FOREX.COM',
    shortLabel: 'FRX',
    color: '#ffffff',
    bg: '#00502f',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://forex.com&size=128',
  },
  OKX: {
    label: 'OKX',
    shortLabel: 'OKX',
    color: '#ffffff',
    bg: '#000000',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://okx.com&size=128',
  },
  'OKX / BINANCE': {
    label: 'OKX',
    shortLabel: 'OKX',
    color: '#ffffff',
    bg: '#000000',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://okx.com&size=128',
  },
  'OKX / BINANCE FUTURES': {
    label: 'OKX FUT',
    shortLabel: 'OKF',
    color: '#ffffff',
    bg: '#000000',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://okx.com&size=128',
  },
  'OKX / BYBIT': {
    label: 'OKX',
    shortLabel: 'OKX',
    color: '#ffffff',
    bg: '#000000',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://okx.com&size=128',
  },
  BYBIT: {
    label: 'BYBIT',
    shortLabel: 'BYB',
    color: '#111111',
    bg: '#f7a600',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://bybit.com&size=128',
  },
  'BYBIT / BINANCE': {
    label: 'BYBIT',
    shortLabel: 'BYB',
    color: '#111111',
    bg: '#f7a600',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://bybit.com&size=128',
  },
  'BYBIT / BINANCE FUTURES': {
    label: 'BYBIT FUT',
    shortLabel: 'BYF',
    color: '#111111',
    bg: '#f7a600',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://bybit.com&size=128',
  },
  KRAKEN: {
    label: 'KRAKEN',
    shortLabel: 'KRK',
    color: '#ffffff',
    bg: '#5741d9',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://kraken.com&size=128',
  },
  'KRAKEN / BINANCE': {
    label: 'KRAKEN',
    shortLabel: 'KRK',
    color: '#ffffff',
    bg: '#5741d9',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://kraken.com&size=128',
  },
  KUCOIN: {
    label: 'KUCOIN',
    shortLabel: 'KUC',
    color: '#ffffff',
    bg: '#24a182',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://kucoin.com&size=128',
  },
  'KUCOIN / BINANCE': {
    label: 'KUCOIN',
    shortLabel: 'KUC',
    color: '#ffffff',
    bg: '#24a182',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://kucoin.com&size=128',
  },
  'KUCOIN / BINANCE FUTURES': {
    label: 'KUCOIN FUT',
    shortLabel: 'KUC',
    color: '#ffffff',
    bg: '#24a182',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://kucoin.com&size=128',
  },
  HTX: {
    label: 'HTX',
    shortLabel: 'HTX',
    color: '#ffffff',
    bg: '#004de6',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://htx.com&size=128',
  },
  'HTX / BINANCE': {
    label: 'HTX',
    shortLabel: 'HTX',
    color: '#ffffff',
    bg: '#004de6',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://htx.com&size=128',
  },
  'NASDAQ / BINGX': {
    label: 'NASDAQ',
    shortLabel: 'NDQ',
    color: '#ffffff',
    bg: '#093a7c',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://nasdaq.com&size=128',
  },
  'NYSE / BINGX': {
    label: 'NYSE',
    shortLabel: 'NYS',
    color: '#ffffff',
    bg: '#195f9c',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.nyse.com&size=128',
  },
  'CME / BINGX': {
    label: 'CME',
    shortLabel: 'CME',
    color: '#ffffff',
    bg: '#005b9f',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://cmegroup.com&size=128',
  },
  'CBOT / BINGX': {
    label: 'CBOT',
    shortLabel: 'CBO',
    color: '#ffffff',
    bg: '#005b9f',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://cmegroup.com&size=128',
  },
  'ICE / BINGX': {
    label: 'ICE / USD',
    shortLabel: 'ICE',
    color: '#ffffff',
    bg: '#00875a',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://ice.com&size=128',
  },
  'OSE / BINGX': {
    label: 'OSE / JP',
    shortLabel: 'JP',
    color: '#ffffff',
    bg: '#bc002d',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.jpx.co.jp&size=128',
  },
  'LSE / BINGX': {
    label: 'LSE / UK',
    shortLabel: 'UK',
    color: '#ffffff',
    bg: '#012169',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://londonstockexchange.com&size=128',
  },
  'EUREX / BINGX': {
    label: 'EUREX',
    shortLabel: 'EU',
    color: '#ffffff',
    bg: '#003087',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://eurex.com&size=128',
  },
};

/** Lấy cấu hình sàn (fallback nếu không tìm thấy) */
export const getExchangeConfig = (exchange: string): ExchangeConfig => {
  return (
    EXCHANGE_CONFIGS[exchange.toUpperCase()] ?? {
      label: exchange,
      shortLabel: exchange.slice(0, 3).toUpperCase(),
      color: '#ffffff',
      bg: '#4a4a6a',
    }
  );
};

/** Map logo riêng cho các Crypto */
const CRYPTO_LOGOS: Record<string, string> = {
  BTC: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
  ETH: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  BNB: 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
  SOL: 'https://cryptologos.cc/logos/solana-sol-logo.png',
  XRP: 'https://cryptologos.cc/logos/xrp-xrp-logo.png',
  ADA: 'https://cryptologos.cc/logos/cardano-ada-logo.png',
  DOGE: 'https://cryptologos.cc/logos/dogecoin-doge-logo.png',
  DOT: 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png',
  LINK: 'https://cryptologos.cc/logos/chainlink-link-logo.png',
  MATIC: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
  LDO: 'https://cryptologos.cc/logos/lido-dao-ldo-logo.png',
  TRX: 'https://cryptologos.cc/logos/tron-trx-logo.png',
  SHIB: 'https://cryptologos.cc/logos/shiba-inu-shib-logo.png',
  PEPE: 'https://cryptologos.cc/logos/pepe-pepe-logo.png',
  AVAX: 'https://cryptologos.cc/logos/avalanche-avax-logo.png',
  SUI: 'https://assets.coingecko.com/coins/images/26375/standard/sui_asset.jpeg',
  NEAR: 'https://cryptologos.cc/logos/near-protocol-near-logo.png',
  APT: 'https://assets.coingecko.com/coins/images/26455/standard/aptos_round.png',
  ARB: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png',
  OP: 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.png',
  TIA: 'https://assets.coingecko.com/coins/images/31967/standard/tia.png',
  TON: 'https://cryptologos.cc/logos/toncoin-ton-logo.png',
  INJ: 'https://cryptologos.cc/logos/injective-inj-logo.png',
  RENDER: 'https://cryptologos.cc/logos/render-token-rndr-logo.png',
  WIF: 'https://assets.coingecko.com/coins/images/33566/standard/dogwifhat.jpg',
  SEI: 'https://assets.coingecko.com/coins/images/28205/standard/Sei_Logo_%281%29.png',
};

export const getCoinLogoUrl = (symbol: string): string => {
  const cleaned = symbol
    .replace(/\.P$/i, '')        // bỏ .P (futures)
    .replace(/\.SWAP$/i, '')     // bỏ .SWAP
    .replace(/USDT$/i, '')       // bỏ USDT
    .replace(/BUSD$/i, '')       // bỏ BUSD
    .replace(/USD$/i, '')        // bỏ USD
    .replace(/^1000/i, '')       // bỏ prefix 1000
    .toLowerCase();

  // Coincap CDN cung cấp 100% đầy đủ logo crypto chất lượng cao 2x
  return `https://assets.coincap.io/assets/icons/${cleaned}@2x.png`;
};

/** Màu và nhận diện cho hàng hóa / forex */
const COMMODITY_COLORS: Record<string, { bg: string; color: string; logoUrl?: string }> = {
  XAUUSD: { bg: '#b8860b', color: '#ffffff', logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://gold.org&size=128' },
  XAGUSD: { bg: '#708090', color: '#ffffff' },
  USOIL: { bg: '#333333', color: '#ffffff' },
  BRENT: { bg: '#1c1c1c', color: '#ffffff' },
  NGAS: { bg: '#0288d1', color: '#ffffff' },
  COPPER: { bg: '#b87333', color: '#ffffff' },
  PLATINUM: { bg: '#607d8b', color: '#ffffff' },
  EURUSD: { bg: '#003087', color: '#ffffff' },
  GBPUSD: { bg: '#012169', color: '#ffffff' },
  USDJPY: { bg: '#bc002d', color: '#ffffff' },
  GBPJPY: { bg: '#6a1b9a', color: '#ffffff' },
  EURJPY: { bg: '#1565c0', color: '#ffffff' },
  AUDUSD: { bg: '#00008b', color: '#ffffff' },
  USDCAD: { bg: '#c8102e', color: '#ffffff' },
  USDCHF: { bg: '#d32f2f', color: '#ffffff' },
  NZDUSD: { bg: '#00247d', color: '#ffffff' },
  EURGBP: { bg: '#2e7d32', color: '#ffffff' },
  AUDJPY: { bg: '#ad1457', color: '#ffffff' },
  CHFJPY: { bg: '#c62828', color: '#ffffff' },
  CADJPY: { bg: '#d84315', color: '#ffffff' },
};

/** Màu avatar & logo cho cổ phiếu Mỹ */
const US_STOCK_COLORS: Record<string, { bg: string; color: string; logoUrl?: string }> = {
  AAPL: { bg: '#555555', color: '#ffffff', logoUrl: 'https://financialmodelingprep.com/image-stock/AAPL.png' },
  MSFT: { bg: '#00a4ef', color: '#ffffff', logoUrl: 'https://financialmodelingprep.com/image-stock/MSFT.png' },
  TSLA: { bg: '#e23d28', color: '#ffffff', logoUrl: 'https://financialmodelingprep.com/image-stock/TSLA.png' },
  NVDA: { bg: '#76b900', color: '#ffffff', logoUrl: 'https://financialmodelingprep.com/image-stock/NVDA.png' },
  GOOGL: { bg: '#4285f4', color: '#ffffff', logoUrl: 'https://financialmodelingprep.com/image-stock/GOOGL.png' },
  AMZN: { bg: '#ff9900', color: '#111111', logoUrl: 'https://financialmodelingprep.com/image-stock/AMZN.png' },
  META: { bg: '#0668e1', color: '#ffffff', logoUrl: 'https://financialmodelingprep.com/image-stock/META.png' },
  AMD: { bg: '#ed1c24', color: '#ffffff', logoUrl: 'https://financialmodelingprep.com/image-stock/AMD.png' },
  INTC: { bg: '#0071c5', color: '#ffffff', logoUrl: 'https://financialmodelingprep.com/image-stock/INTC.png' },
  BABA: { bg: '#ff6a00', color: '#ffffff', logoUrl: 'https://financialmodelingprep.com/image-stock/BABA.png' },
  DIS: { bg: '#113ccf', color: '#ffffff', logoUrl: 'https://assets.parqet.com/logos/symbol/DIS?format=png' },
  COIN: { bg: '#0052ff', color: '#ffffff', logoUrl: 'https://financialmodelingprep.com/image-stock/COIN.png' },
  UBER: { bg: '#000000', color: '#ffffff', logoUrl: 'https://financialmodelingprep.com/image-stock/UBER.png' },
  ORCL: { bg: '#f80000', color: '#ffffff', logoUrl: 'https://financialmodelingprep.com/image-stock/ORCL.png' },
  KO: { bg: '#f40009', color: '#ffffff', logoUrl: 'https://financialmodelingprep.com/image-stock/KO.png' },
  JNJ: { bg: '#d51900', color: '#ffffff', logoUrl: 'https://assets.parqet.com/logos/symbol/JNJ?format=png' },
};

/** Màu avatar cho Chỉ số */
const INDEX_COLORS: Record<string, { bg: string; color: string; logoUrl?: string }> = {
  DXY: { bg: '#00875a', color: '#ffffff', logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://ice.com&size=128' },
  SPX: { bg: '#093a7c', color: '#ffffff', logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://spglobal.com&size=128' },
  NDX: { bg: '#005b9f', color: '#ffffff', logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://nasdaq.com&size=128' },
  DJI: { bg: '#1a1a1a', color: '#ffffff', logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://dowjones.com&size=128' },
  JP225: { bg: '#bc002d', color: '#ffffff', logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.jpx.co.jp&size=128' },
  UK100: { bg: '#012169', color: '#ffffff', logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://londonstockexchange.com&size=128' },
  EU50: { bg: '#003087', color: '#ffffff', logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://stoxx.com&size=128' },
  US2000: { bg: '#005b9f', color: '#ffffff', logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://cmegroup.com&size=128' },
};

export interface AssetStyle {
  bg: string;
  color: string;
  text: string;       // text to show inside avatar
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
