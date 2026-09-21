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
  symbol: string;
  initialBalance: number;
  currentBalance: number;
  status: 'running' | 'completed';
  startedAt: string;
  completedAt?: string;
}

export const getSessions = async (): Promise<PaperSession[]> => {
  const res = await fetch(`${API_URL}/paper-trading`, { credentials: 'include',
    });
  if (!res.ok) throw new Error('Failed to fetch sessions');
  return res.json();
};

export const createSession = async (data: { symbol: string; initialBalance: number }): Promise<PaperSession> => {
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

export const updateSession = async (id: string, data: { currentBalance?: number; status?: 'running' | 'completed' }): Promise<PaperSession> => {
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
