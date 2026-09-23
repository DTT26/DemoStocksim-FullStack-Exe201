const ROOT_API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const API_BASE_URL = `${ROOT_API}/trade`;

// Fallback UserID chỉ dành khi hoàn toàn không có tài khoản đăng nhập
export const DUMMY_USER_ID = '64f7b1e4a3b9c2d1e8f9a0b1';

export const getActiveUserId = (providedUserId?: string): string => {
  if (providedUserId) return providedUserId;
  const storedUserId = localStorage.getItem('userId');
  if (storedUserId) return storedUserId;

  const token = localStorage.getItem('token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.userId) return payload.userId;
    } catch {}
  }
  return DUMMY_USER_ID;
};

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const tradingApi = {
  buyStock: async (symbol: string, margin: number, leverage: number, currentPrice: number, sl?: number, tp?: number, userId?: string) => {
    const actualUserId = getActiveUserId(userId);
    const res = await fetch(`${API_BASE_URL}/buy`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId: actualUserId, symbol, margin, leverage, currentPrice, stopLoss: sl, takeProfit: tp })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Lỗi hệ thống');
    }
    return await res.json();
  },

  sellStock: async (symbol: string, margin: number, leverage: number, currentPrice: number, userId?: string) => {
    const actualUserId = getActiveUserId(userId);
    const res = await fetch(`${API_BASE_URL}/sell`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId: actualUserId, symbol, margin, leverage, currentPrice })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Lỗi hệ thống');
    }
    return await res.json();
  },

  closePosition: async (symbol: string, side: 'LONG'|'SHORT', currentPrice: number, userId?: string) => {
    const actualUserId = getActiveUserId(userId);
    const res = await fetch(`${API_BASE_URL}/close`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId: actualUserId, symbol, side, currentPrice })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Lỗi hệ thống');
    }
    return await res.json();
  },

  updateTPSL: async (symbol: string, side: 'LONG'|'SHORT', takeProfit?: number, stopLoss?: number, userId?: string) => {
    const actualUserId = getActiveUserId(userId);
    const res = await fetch(`${API_BASE_URL}/tpsl`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId: actualUserId, symbol, side, takeProfit, stopLoss })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Lỗi hệ thống');
    }
    return await res.json();
  },

  addMargin: async (symbol: string, side: 'LONG'|'SHORT', amount: number, userId?: string) => {
    const actualUserId = getActiveUserId(userId);
    const res = await fetch(`${API_BASE_URL}/margin/add`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId: actualUserId, symbol, side, amount })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Lỗi hệ thống');
    }
    return await res.json();
  },

  getPortfolio: async (userId?: string) => {
    const actualUserId = getActiveUserId(userId);
    const res = await fetch(`${API_BASE_URL}/portfolio/${actualUserId}`, {
      headers: getHeaders()
    });
    return await res.json();
  },

  getTransactions: async (userId?: string) => {
    const actualUserId = getActiveUserId(userId);
    const res = await fetch(`${API_BASE_URL}/transactions/${actualUserId}`, {
      headers: getHeaders()
    });
    return await res.json();
  },

  placeLimitOrder: async (
    symbol: string,
    side: 'LONG'|'SHORT',
    limitPrice: number,
    margin: number,
    leverage: number,
    stopLoss?: number,
    takeProfit?: number,
    orderType: 'LIMIT' | 'STOP' = 'LIMIT',
    userId?: string
  ) => {
    const actualUserId = getActiveUserId(userId);
    const res = await fetch(`${API_BASE_URL}/limit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId: actualUserId, symbol, side, limitPrice, margin, leverage, stopLoss, takeProfit, orderType })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Lỗi hệ thống');
    }
    return await res.json();
  },

  cancelLimitOrder: async (orderId: string, userId?: string) => {
    const actualUserId = getActiveUserId(userId);
    const res = await fetch(`${API_BASE_URL}/limit/cancel`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId: actualUserId, orderId })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Lỗi hệ thống');
    }
    return await res.json();
  }
};
