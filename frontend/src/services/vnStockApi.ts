import type { KLineData } from 'klinecharts';

const ROOT_API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const API_BASE = `${ROOT_API}/stocks`;

export interface VnStockQuote {
  symbol: string;
  price: number;
  change: number;
  percent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  timestamp: number;
}

export interface FetchVnKlinesParams {
  symbol: string;
  timeframe: string;
  from?: number; // timestamp in seconds
  to?: number;   // timestamp in seconds
}

export const fetchVnStockKlines = async ({
  symbol,
  timeframe,
  from,
  to
}: FetchVnKlinesParams): Promise<KLineData[]> => {
  try {
    const params = new URLSearchParams({
      symbol: symbol.toUpperCase().trim(),
      resolution: timeframe
    });
    if (from) params.append('from', String(Math.floor(from)));
    if (to) params.append('to', String(Math.floor(to)));

    const res = await fetch(`${API_BASE}/klines?${params.toString()}`);
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      return data.data as KLineData[];
    }
    return [];
  } catch (error) {
    console.warn(`[vnStockApi] Failed to fetch klines for ${symbol}:`, error);
    return [];
  }
};

export const fetchVnStockQuotes = async (symbols: string[]): Promise<Record<string, VnStockQuote>> => {
  try {
    const symList = symbols.join(',');
    const res = await fetch(`${API_BASE}/quotes?symbols=${encodeURIComponent(symList)}`);
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const data = await res.json();
    if (data.success && data.data) {
      return data.data;
    }
    return {};
  } catch (error) {
    console.warn('[vnStockApi] Failed to fetch quotes:', error);
    return {};
  }
};
