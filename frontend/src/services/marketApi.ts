import { type Watchlist } from '../features/market/components/WatchlistPanel';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// --- Watchlist API ---

export const getWatchlists = async (): Promise<Watchlist[]> => {
  const res = await fetch(`${API_URL}/watchlists`, { credentials: 'include',
    });
  if (!res.ok) throw new Error('Failed to fetch watchlists');
  return res.json();
};

export const createWatchlist = async (data: { name: string; symbols?: string[] }): Promise<Watchlist> => {
  const res = await fetch(`${API_URL}/watchlists`, { credentials: 'include',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create watchlist');
  return res.json();
};

export const updateWatchlist = async (id: string, data: { name?: string; symbols?: string[] }): Promise<Watchlist> => {
  const res = await fetch(`${API_URL}/watchlists/${id}`, { credentials: 'include',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update watchlist');
  return res.json();
};

export const deleteWatchlist = async (id: string): Promise<void> => {
  const res = await fetch(`${API_URL}/watchlists/${id}`, { credentials: 'include',
    method: 'DELETE',
    });
  if (!res.ok) throw new Error('Failed to delete watchlist');
};

// --- Paper Trading Sessions API ---

export interface PaperSession {
  _id: string;
  name?: string;
  symbol: string;
  timeframe?: string;
  initialBalance: number;
  balance?: number;
  equity?: number;
  currentBalance?: number; // legacy
  usedMargin?: number;
  freeMargin?: number;
  replayStartTime?: string;
  replayCurrentTime?: string;
  status: 'running' | 'completed';
  startedAt: string;
  completedAt?: string;
  config?: any;
  statistics?: {
    totalTrades: number;
    wins: number;
    losses: number;
    winRate: number;
    grossProfit: number;
    grossLoss: number;
    netPnL: number;
    averageWin?: number;
    averageLoss?: number;
    largestWin?: number;
    largestLoss?: number;
    maxDrawdown?: number;
    averageRR?: number;
  };
}

export const getSessions = async (): Promise<PaperSession[]> => {
  const res = await fetch(`${API_URL}/paper-trading`, { credentials: 'include',
    });
  if (!res.ok) throw new Error('Failed to fetch sessions');
  return res.json();
};

export const getSessionDetails = async (id: string): Promise<any> => {
  const res = await fetch(`${API_URL}/paper-trading/${id}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch session details');
  return res.json();
};

export const createSession = async (data: any): Promise<any> => {
  const res = await fetch(`${API_URL}/paper-trading`, { credentials: 'include',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create session');
  return res.json();
};

export const updateSession = async (id: string, data: any): Promise<any> => {
  const res = await fetch(`${API_URL}/paper-trading/${id}`, { credentials: 'include',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update session');
  return res.json();
};

export const deleteSession = async (id: string): Promise<any> => {
  const res = await fetch(`${API_URL}/paper-trading/${id}`, {
    credentials: 'include',
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete session');
  return res.json();
};
