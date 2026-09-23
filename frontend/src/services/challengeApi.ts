const ROOT_API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const API_BASE_URL = `${ROOT_API}/challenge`;

// Tự động gia hạn token khi access token hết hạn (hỗ trợ cả HttpOnly Cookie lẫn localStorage)
const tryRefreshToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem('refreshToken');

  try {
    const res = await fetch(`${ROOT_API}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ refreshToken: refreshToken || undefined }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.accessToken) {
        localStorage.setItem('token', data.accessToken);
        return data.accessToken;
      }
    }
  } catch (e) {
    console.warn('[challengeApi] Auto token refresh failed:', e);
  }
  return null;
};

// Wrapper fetch có tự động gửi HttpOnly cookie (credentials: 'include') và gắn Auth Bearer nếu có
const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  let token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...((options.headers as any) || {}),
  };

  let res = await fetch(url, { credentials: 'include', ...options, headers });

  // Nếu gặp 401 (token expired), tự động làm mới và thử lại 1 lần
  if (res.status === 401) {
    const newToken = await tryRefreshToken();
    if (newToken) {
      const retryHeaders = {
        ...headers,
        'Authorization': `Bearer ${newToken}`,
      };
      res = await fetch(url, { credentials: 'include', ...options, headers: retryHeaders });
    }
  }

  return res;
};

export const challengeApi = {
  // Lấy cấu hình 6 level từ backend
  getLevels: async () => {
    const res = await authenticatedFetch(`${API_BASE_URL}/levels`);
    return await res.json();
  },

  // Lấy tiến trình bài thi của user hiện tại từ backend
  getMyChallenge: async () => {
    const res = await authenticatedFetch(`${API_BASE_URL}/me`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      if (res.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }
      throw new Error(err.message || 'Chưa thể lấy thông tin bài thi');
    }
    return await res.json();
  },

  // Bắt đầu làm bài thi cấp vốn
  startChallenge: async (levelId: number) => {
    const res = await authenticatedFetch(`${API_BASE_URL}/start`, {
      method: 'POST',
      body: JSON.stringify({ levelId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      if (res.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để bắt đầu thi.');
      }
      throw new Error(err.message || 'Không thể bắt đầu bài thi');
    }
    return await res.json();
  },

  // Reset bài thi
  resetChallenge: async () => {
    const res = await authenticatedFetch(`${API_BASE_URL}/reset`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      if (res.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để reset bài thi.');
      }
      throw new Error(err.message || 'Không thể reset bài thi');
    }
    return await res.json();
  },

  // Tạm dừng bài thi
  pauseChallenge: async () => {
    const res = await authenticatedFetch(`${API_BASE_URL}/pause`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể tạm dừng bài thi');
    }
    return await res.json();
  },

  // Tiếp tục bài thi
  resumeChallenge: async () => {
    const res = await authenticatedFetch(`${API_BASE_URL}/resume`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể tiếp tục bài thi');
    }
    return await res.json();
  },

  // Kết thúc / Hủy bài thi
  endChallenge: async () => {
    const res = await authenticatedFetch(`${API_BASE_URL}/end`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể kết thúc bài thi');
    }
    return await res.json();
  },

  // Đánh giá chỉ số rủi ro thời gian thực (Backend tự động dùng đúng số dư của bài thi Cấp Vốn)
  evaluateRisk: async (unrealizedPnLUSD: number, hasExecutedTradeToday = false) => {
    const res = await authenticatedFetch(`${API_BASE_URL}/evaluate`, {
      method: 'POST',
      body: JSON.stringify({ unrealizedPnLUSD, hasExecutedTradeToday }),
    });
    if (!res.ok) {
      return null;
    }
    return await res.json();
  },
};
