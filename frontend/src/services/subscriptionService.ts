const getRootApi = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }
  return 'http://localhost:3000/api';
};

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export interface SubscriptionInfo {
  success: boolean;
  plan: 'FREE' | 'PREMIUM';
  dailyAiLimit: number;
  dailyAiUsed: number;
  remainingToday: number;
  premiumExpiresAt?: string | null;
  isPremium: boolean;
  lastActiveDate?: string;
}

export interface CreateCheckoutResult {
  success: boolean;
  orderCode: number;
  checkoutUrl: string;
  qrCode?: string;
  message?: string;
}

export const subscriptionService = {
  async getMySubscription(): Promise<SubscriptionInfo> {
    const res = await fetch(`${getRootApi()}/v1/subscription/me`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    const json = await res.json();
    if (!res.ok || json.success === false) {
      throw new Error(json.message || 'Không thể lấy thông tin gói đăng ký');
    }
    return json;
  },

  async createCheckout(plan: string = 'PREMIUM_MONTHLY'): Promise<CreateCheckoutResult> {
    const res = await fetch(`${getRootApi()}/v1/payment/create-checkout`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ plan })
    });
    const json = await res.json();
    if (!res.ok && !json.message) {
      throw new Error('Lỗi khởi tạo cổng thanh toán');
    }
    return json;
  },

  async verifyOrder(orderCode: number): Promise<{ success: boolean; status: string; is_premium?: boolean; message?: string }> {
    const res = await fetch(`${getRootApi()}/v1/payment/verify-order/${orderCode}`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    const json = await res.json();
    return json;
  }
};
