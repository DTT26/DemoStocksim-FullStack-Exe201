import { type Watchlist } from '../features/market/components/WatchlistPanel';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// --- Watchlist API ---

export const getWatchlists = async (token: string): Promise<Watchlist[]> => {
  const res = await fetch(`${API_URL}/watchlists`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch watchlists');
  return res.json();
};

export const createWatchlist = async (token: string, data: { name: string; symbols?: string[] }): Promise<Watchlist> => {
  const res = await fetch(`${API_URL}/watchlists`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create watchlist');
  return res.json();
};

export const updateWatchlist = async (token: string, id: string, data: { name?: string; symbols?: string[] }): Promise<Watchlist> => {
  const res = await fetch(`${API_URL}/watchlists/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update watchlist');
  return res.json();
};

export const deleteWatchlist = async (token: string, id: string): Promise<void> => {
  const res = await fetch(`${API_URL}/watchlists/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
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

export const getSessions = async (token: string): Promise<PaperSession[]> => {
  const res = await fetch(`${API_URL}/paper-trading`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch sessions');
  return res.json();
};

export const createSession = async (token: string, data: { symbol: string; initialBalance: number }): Promise<PaperSession> => {
  const res = await fetch(`${API_URL}/paper-trading`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create session');
  return res.json();
};

export const updateSession = async (token: string, id: string, data: { currentBalance?: number; status?: 'running' | 'completed' }): Promise<PaperSession> => {
  const res = await fetch(`${API_URL}/paper-trading/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update session');
  return res.json();
};
