const API_BASE_URL = 'http://localhost:3000/api/trade';

// Fake UserID (Dành cho việc test khi chưa có Auth từ Member 3)
// Phải đúng chuẩn 24 ký tự Hex của Mongoose ObjectId
export const DUMMY_USER_ID = '64f7b1e4a3b9c2d1e8f9a0b1';

export const tradingApi = {
  buyStock: async (symbol: string, margin: number, leverage: number, currentPrice: number, sl?: number, tp?: number) => {
    const res = await fetch(`${API_BASE_URL}/buy`, { credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: DUMMY_USER_ID, symbol, margin, leverage, currentPrice, stopLoss: sl, takeProfit: tp })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Lỗi hệ thống');
    }
    return await res.json();
  },

  sellStock: async (symbol: string, margin: number, leverage: number, currentPrice: number) => {
    const res = await fetch(`${API_BASE_URL}/sell`, { credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: DUMMY_USER_ID, symbol, margin, leverage, currentPrice })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Lỗi hệ thống');
    }
    return await res.json();
  },

  closePosition: async (symbol: string, side: 'LONG'|'SHORT', currentPrice: number) => {
    const res = await fetch(`${API_BASE_URL}/close`, { credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: DUMMY_USER_ID, symbol, side, currentPrice })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Lỗi hệ thống');
    }
    return await res.json();
  },

  updateTPSL: async (symbol: string, side: 'LONG'|'SHORT', takeProfit?: number, stopLoss?: number) => {
    const res = await fetch(`${API_BASE_URL}/tpsl`, { credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: DUMMY_USER_ID, symbol, side, takeProfit, stopLoss })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Lỗi hệ thống');
    }
    return await res.json();
  },

  addMargin: async (symbol: string, side: 'LONG'|'SHORT', amount: number) => {
    const res = await fetch(`${API_BASE_URL}/margin/add`, { credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: DUMMY_USER_ID, symbol, side, amount })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Lỗi hệ thống');
    }
    return await res.json();
  },

  getPortfolio: async () => {
    const res = await fetch(`${API_BASE_URL}/portfolio/${DUMMY_USER_ID}`);
    return await res.json();
  },

  getTransactions: async () => {
    const res = await fetch(`${API_BASE_URL}/transactions/${DUMMY_USER_ID}`);
    return await res.json();
  },

  placeLimitOrder: async (symbol: string, side: 'LONG'|'SHORT', limitPrice: number, margin: number, leverage: number, stopLoss?: number, takeProfit?: number, orderType: 'LIMIT' | 'STOP' = 'LIMIT') => {
    const res = await fetch(`${API_BASE_URL}/limit`, { credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: DUMMY_USER_ID, symbol, side, limitPrice, margin, leverage, stopLoss, takeProfit, orderType })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Lỗi hệ thống');
    }
    return await res.json();
  },

  cancelLimitOrder: async (orderId: string) => {
    const res = await fetch(`${API_BASE_URL}/limit/cancel`, { credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: DUMMY_USER_ID, orderId })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Lỗi hệ thống');
    }
    return await res.json();
  }
};
