import { create } from 'zustand';
import { STOCKS, type Stock } from '../features/market/data';
import {
  BINGX_REVERSE_MAP,
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

      // 1. Parse Binance Spot (24hr ticker)
      if (spotRes && spotRes.ok) {
        const data = await spotRes.json();
        if (Array.isArray(data)) {
          data.forEach((item: any) => {
            const price = parseFloat(item.lastPrice);
            const change = parseFloat(item.priceChange);
            const percent = parseFloat(item.priceChangePercent);
            if (!isNaN(price) && price > 0) {
              tickerMap[item.symbol] = {
                symbol: item.symbol,
                price,
                change: isNaN(change) ? 0 : change,
                percent: isNaN(percent) ? 0 : percent,
                type: isNaN(change) ? 'up' : (change >= 0 ? 'up' : 'down'),
                high24h: parseFloat(item.highPrice) || price,
                low24h: parseFloat(item.lowPrice) || price,
                volume24h: parseFloat(item.volume) || 0,
                quoteVolume24h: parseFloat(item.quoteVolume) || 0,
              };
            }
          });
        }
      }

      // 2. Parse Binance Futures (24hr ticker)
      if (futRes && futRes.ok) {
        const data = await futRes.json();
        if (Array.isArray(data)) {
          data.forEach((item: any) => {
            const price = parseFloat(item.lastPrice);
            const change = parseFloat(item.priceChange);
            const percent = parseFloat(item.priceChangePercent);
            if (!isNaN(price) && price > 0) {
              const tickerObj: LiveTickerData = {
                symbol: `${item.symbol}.P`,
                price,
                change: isNaN(change) ? 0 : change,
                percent: isNaN(percent) ? 0 : percent,
                type: isNaN(change) ? 'up' : (change >= 0 ? 'up' : 'down'),
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
      // BingX fields: lastPrice, priceChange (string), priceChangePercent (string)
      if (bingxRes && bingxRes.ok) {
        const json = await bingxRes.json();
        if (json.code === 0 && Array.isArray(json.data)) {
          json.data.forEach((item: any) => {
            const price = parseFloat(item.lastPrice);
            const change = parseFloat(item.priceChange);       // BingX: "priceChange"
            const percent = parseFloat(item.priceChangePercent); // BingX: "priceChangePercent"
            if (!isNaN(price) && price > 0) {
              const bingxSym = item.symbol;
              const stdSym = BINGX_REVERSE_MAP[bingxSym] || bingxSym;

              const tickerObj: LiveTickerData = {
                symbol: stdSym,
                price,
                change: isNaN(change) ? 0 : change,
                percent: isNaN(percent) ? 0 : percent,
                type: isNaN(change) ? 'up' : (change >= 0 ? 'up' : 'down'),
                high24h: parseFloat(item.highPrice) || price,
                low24h: parseFloat(item.lowPrice) || price,
                volume24h: parseFloat(item.volume) || 0,
                quoteVolume24h: parseFloat(item.quoteVolume) || 0,
              };

              tickerMap[stdSym] = tickerObj;
              tickerMap[bingxSym] = tickerObj; // lưu cả symbol gốc BingX
            }
          });
        }
      }

      // Cập nhật stocks - QUAN TRỌNG: KHÔNG mutation object gốc, luôn spread để
      // Zustand/React detect được sự thay đổi và trigger re-render
      const currentStocks = get().stocks;
      const updatedStocks: Stock[] = currentStocks.map(stock => {
        const t = tickerMap[stock.symbol];
        if (t && t.price > 0) {
          // Trả về object HOÀN TOÀN MỚI
          return {
            ...stock,
            price: t.price,
            change: t.change,
            percent: t.percent,
            type: t.type as 'up' | 'down',
            volume24h: t.quoteVolume24h > 0 ? t.quoteVolume24h : stock.volume24h,
          };
        }
        // Không có data mới → vẫn trả về spread mới để tránh stale reference
        return { ...stock };
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
