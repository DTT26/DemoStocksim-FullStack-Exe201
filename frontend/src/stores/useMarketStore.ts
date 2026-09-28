import { create } from 'zustand';
import { STOCKS, type Stock } from '../features/market/data';
import {
  fetchAllMarketLivePrices,
  BINGX_REVERSE_MAP,
  type FetchMarketKlinesParams,
} from '../services/marketDataService';

export interface LiveTickerData {
  symbol: string;
  price: number;
  change: number;
  percent: number;
  type: 'up' | 'down';
  high24h: number;
  low24h: number;
  volume24h: number;
  quoteVolume24h: number;
}

interface MarketState {
  stocks: Stock[];
  tickers: Record<string, LiveTickerData>;
  isLoading: boolean;
  lastUpdated: number;
  fetchMarketData: () => Promise<void>;
  getStock: (symbol: string) => Stock | undefined;
}

export const useMarketStore = create<MarketState>((set, get) => ({
  stocks: STOCKS,
  tickers: {},
  isLoading: false,
  lastUpdated: 0,

  fetchMarketData: async () => {
    try {
      const [spotRes, futRes, bingxRes] = await Promise.all([
        fetch('https://api.binance.com/api/v3/ticker/24hr').catch(() => null),
        fetch('https://fapi.binance.com/fapi/v1/ticker/24hr').catch(() => null),
        fetch('https://open-api.bingx.com/openApi/swap/v2/quote/ticker').catch(() => null),
      ]);

      const tickerMap: Record<string, LiveTickerData> = {};

      // 1. Parse Binance Spot
      if (spotRes && spotRes.ok) {
        const data = await spotRes.json();
        if (Array.isArray(data)) {
          data.forEach((item: any) => {
            const price = parseFloat(item.lastPrice);
            const change = parseFloat(item.priceChange);
            const percent = parseFloat(item.priceChangePercent);
            if (!isNaN(price)) {
              tickerMap[item.symbol] = {
                symbol: item.symbol,
                price,
                change,
                percent,
                type: change >= 0 ? 'up' : 'down',
                high24h: parseFloat(item.highPrice) || price,
                low24h: parseFloat(item.lowPrice) || price,
                volume24h: parseFloat(item.volume) || 0,
                quoteVolume24h: parseFloat(item.quoteVolume) || 0,
              };
            }
          });
        }
      }

      // 2. Parse Binance Futures
      if (futRes && futRes.ok) {
        const data = await futRes.json();
        if (Array.isArray(data)) {
          data.forEach((item: any) => {
            const price = parseFloat(item.lastPrice);
            const change = parseFloat(item.priceChange);
            const percent = parseFloat(item.priceChangePercent);
            if (!isNaN(price)) {
              const tickerObj: LiveTickerData = {
                symbol: `${item.symbol}.P`,
                price,
                change,
                percent,
                type: change >= 0 ? 'up' : 'down',
                high24h: parseFloat(item.highPrice) || price,
                low24h: parseFloat(item.lowPrice) || price,
                volume24h: parseFloat(item.volume) || 0,
                quoteVolume24h: parseFloat(item.quoteVolume) || 0,
              };
              tickerMap[`${item.symbol}.P`] = tickerObj;
              if (!tickerMap[item.symbol]) {
                tickerMap[item.symbol] = { ...tickerObj, symbol: item.symbol };
              }
            }
          });
        }
      }

      // 3. Parse BingX (TradFi: Vàng XAUUSD, Dầu, Forex, Cổ phiếu Mỹ, Chỉ số)
      if (bingxRes && bingxRes.ok) {
        const json = await bingxRes.json();
        if (json.code === 0 && Array.isArray(json.data)) {
          json.data.forEach((item: any) => {
            const price = parseFloat(item.lastPrice);
            const change = parseFloat(item.priceChange);
            const percent = parseFloat(item.priceChangePercent);
            if (!isNaN(price)) {
              const bingxSym = item.symbol;
              const stdSym = BINGX_REVERSE_MAP[bingxSym] || bingxSym;

              const tickerObj: LiveTickerData = {
                symbol: stdSym,
                price,
                change,
                percent,
                type: change >= 0 ? 'up' : 'down',
                high24h: parseFloat(item.highPrice) || price,
                low24h: parseFloat(item.lowPrice) || price,
                volume24h: parseFloat(item.volume) || 0,
                quoteVolume24h: parseFloat(item.quoteVolume) || 0,
              };

              tickerMap[stdSym] = tickerObj;
              tickerMap[bingxSym] = tickerObj;
            }
          });
        }
      }

      // Cập nhật danh sách stocks trong store và cả mảng STOCKS tham chiếu
      const updatedStocks = get().stocks.map(stock => {
        const t = tickerMap[stock.symbol];
        if (t) {
          stock.price = t.price;
          stock.change = t.change;
          stock.percent = t.percent;
          stock.type = t.type;
          if (t.quoteVolume24h > 0) stock.volume24h = t.quoteVolume24h;
          return {
            ...stock,
            price: t.price,
            change: t.change,
            percent: t.percent,
            type: t.type,
            volume24h: t.quoteVolume24h > 0 ? t.quoteVolume24h : stock.volume24h,
          };
        }
        return stock;
      });

      set({
        stocks: updatedStocks,
        tickers: tickerMap,
        lastUpdated: Date.now(),
      });
    } catch (err) {
      console.warn('Lỗi fetchMarketData:', err);
    }
  },

  getStock: (symbol: string) => {
    return get().stocks.find(s => s.symbol.toUpperCase() === symbol.toUpperCase());
  },
}));
