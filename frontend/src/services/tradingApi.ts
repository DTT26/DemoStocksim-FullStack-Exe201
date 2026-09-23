const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return `${envUrl}/trade`;
  }
  return 'http://localhost:3000/api/trade';
};

const API_BASE_URL = getBaseUrl();

export const tradingApi = {
  buyStock: async (symbol: string, margin: number, leverage: number, currentPrice: number, sl?: number, tp?: number, userId?: string) => {
    const res = await fetch(`${API_BASE_URL}/buy`, {
      credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, symbol, margin, leverage, currentPrice, stopLoss: sl, takeProfit: tp })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Lỗi hệ thống');
    }
    return await res.json();
  },

  sellStock: async (symbol: string, margin: number, leverage: number, currentPrice: number, userId?: string) => {
    const res = await fetch(`${API_BASE_URL}/sell`, {
      credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, symbol, margin, leverage, currentPrice })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Lỗi hệ thống');
    }
    return await res.json();
  },

  closePosition: async (symbol: string, side: 'LONG'|'SHORT', currentPrice: number, userId?: string) => {
    const res = await fetch(`${API_BASE_URL}/close`, {
      credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, symbol, side, currentPrice })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Lỗi hệ thống');
    }
    return await res.json();
  },

  updateTPSL: async (symbol: string, side: 'LONG'|'SHORT', takeProfit?: number, stopLoss?: number, userId?: string) => {
    const res = await fetch(`${API_BASE_URL}/tpsl`, {
      credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, symbol, side, takeProfit, stopLoss })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Lỗi hệ thống');
    }
    return await res.json();
  },

  addMargin: async (symbol: string, side: 'LONG'|'SHORT', amount: number, userId?: string) => {
    const res = await fetch(`${API_BASE_URL}/margin/add`, {
      credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, symbol, side, amount })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Lỗi hệ thống');
    }
    return await res.json();
  },

  getPortfolio: async (userId?: string) => {
    const url = userId ? `${API_BASE_URL}/portfolio/${userId}` : `${API_BASE_URL}/portfolio`;
    const res = await fetch(url, { credentials: 'include' });
    return await res.json();
  },

  getTransactions: async (userId?: string) => {
    const url = userId ? `${API_BASE_URL}/transactions/${userId}` : `${API_BASE_URL}/transactions`;
    const res = await fetch(url, { credentials: 'include' });
    return await res.json();
  },

  placeLimitOrder: async (symbol: string, side: 'LONG'|'SHORT', limitPrice: number, margin: number, leverage: number, stopLoss?: number, takeProfit?: number, orderType: 'LIMIT' | 'STOP' = 'LIMIT', userId?: string) => {
    const res = await fetch(`${API_BASE_URL}/limit`, {
      credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, symbol, side, limitPrice, margin, leverage, stopLoss, takeProfit, orderType })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Lỗi hệ thống');
    }
    return await res.json();
  },

  cancelLimitOrder: async (orderId: string, userId?: string) => {
    const res = await fetch(`${API_BASE_URL}/limit/cancel`, {
      credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, orderId })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Lỗi hệ thống');
    }
    return await res.json();
  }
};

