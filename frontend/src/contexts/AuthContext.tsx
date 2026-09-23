import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import { LoginModal } from '../components/LoginModal';
import { SuspendedModal } from '../components/SuspendedModal';

export interface User {
  _id: string;
  name: string;
  email: string;
  picture?: string;
  role: 'student' | 'lecturer' | 'admin';
  balance?: number;
  phone?: string;
  bio?: string;
  university?: string;
  studentId?: string;
  class?: string;
  department?: string;
  title?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  loginWithEmail: (email: string, password: string, captchaToken?: string) => Promise<{ success: boolean; message?: string }>;
  registerRequest: (name: string, email: string, password: string, termsAccepted: boolean, captchaToken?: string) => Promise<{ success: boolean; message?: string; devOtp?: string }>;
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; message?: string }>;
  resendOtp: (email: string) => Promise<{ success: boolean; message?: string; devOtp?: string }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
  refreshUser: async () => {},
  loginWithEmail: async () => ({ success: false }),
  registerRequest: async () => ({ success: false }),
  verifyOtp: async () => ({ success: false }),
  resendOtp: async () => ({ success: false }),
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>('');
  const [suspendedModal, setSuspendedModal] = useState<{ isOpen: boolean; message: string } | null>(null);
  const captchaTokenRef = useRef<string>('');

  const fetchUser = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const res = await fetch(`${apiUrl}/users/me`, {
        credentials: 'include'
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        if (userData._id) {
          localStorage.setItem('userId', userData._id);
        }
      } else {
        if (res.status === 403) {
          const errData = await res.json().catch(() => ({}));
          if (errData.message && (errData.message.includes('Suspended') || errData.message.includes('khóa'))) {
            setSuspendedModal({
              isOpen: true,
              message: errData.message
            });
          }
        }
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Đăng nhập bằng Google
  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const tokenToSend = captchaTokenRef.current || captchaToken;
        const res = await fetch(`${apiUrl}/auth/google`, { 
          credentials: 'include',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            access_token: tokenResponse.access_token,
            captchaToken: tokenToSend
          }),
        });
        const data = await res.json();
        
        if (res.ok) {
          if (data.token) {
            localStorage.setItem('token', data.token);
          }
          if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken);
          }
          await fetchUser();
        } else {
          console.error('Backend login failed:', data.message);
          setSuspendedModal({
            isOpen: true,
            message: data.message || 'Tài khoản của bạn đã bị khóa hoặc tạm ngưng (Suspended). Vui lòng liên hệ Quản trị viên để được hỗ trợ.'
          });
        }
      } catch (err) {
        console.error('Failed to authenticate', err);
      }
    },
    onError: () => console.log('Login Failed')
  });

  // Đăng nhập bằng Email & Mật khẩu
  const loginWithEmail = async (email: string, password: string, captchaToken?: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const tokenToSend = captchaToken || captchaTokenRef.current;
      const res = await fetch(`${apiUrl}/auth/login`, {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, captchaToken: tokenToSend }),
      });
      const data = await res.json();

      if (res.ok) {
        if (data.token) localStorage.setItem('token', data.token);
        if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
        await fetchUser();
        return { success: true, message: data.message };
      } else {
        if (res.status === 403 && data.message && (data.message.includes('Suspended') || data.message.includes('khóa'))) {
          setSuspendedModal({
            isOpen: true,
            message: data.message
          });
        }
        return { success: false, message: data.message || 'Đăng nhập không thành công' };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Lỗi kết nối máy chủ' };
    }
  };

  // Bước 1: Yêu cầu đăng ký tài khoản & nhận mã OTP
  const registerRequest = async (name: string, email: string, password: string, termsAccepted: boolean, captchaToken?: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const tokenToSend = captchaToken || captchaTokenRef.current;
      const res = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, termsAccepted, captchaToken: tokenToSend }),
      });
      const data = await res.json();
      return { success: res.ok, message: data.message, devOtp: data.devOtp };
    } catch (err: any) {
      return { success: false, message: err.message || 'Lỗi kết nối khi gửi yêu cầu đăng ký' };
    }
  };

  // Bước 2: Xác thực mã OTP và hoàn tất đăng ký
  const verifyOtp = async (email: string, otp: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const res = await fetch(`${apiUrl}/auth/verify-otp`, {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();

      if (res.ok) {
        if (data.token) localStorage.setItem('token', data.token);
        if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
        await fetchUser();
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Mã OTP không hợp lệ' };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Lỗi kết nối khi xác thực OTP' };
    }
  };

  // Gửi lại mã OTP
  const resendOtp = async (email: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const res = await fetch(`${apiUrl}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      return { success: res.ok, message: data.message, devOtp: data.devOtp };
    } catch (err: any) {
      return { success: false, message: err.message || 'Lỗi kết nối khi gửi lại OTP' };
    }
  };

  const login = () => setIsLoginModalOpen(true);

  const logout = async () => {
    googleLogout();
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      await fetch(`${apiUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Failed to logout on backend', err);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      refreshUser: fetchUser,
      loginWithEmail,
      registerRequest,
      verifyOtp,
      resendOtp,
    }}>
      {children}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onLoginGoogle={(token) => {
          captchaTokenRef.current = token;
          setCaptchaToken(token);
          triggerGoogleLogin();
        }} 
      />
      <SuspendedModal 
        isOpen={Boolean(suspendedModal?.isOpen)} 
        message={suspendedModal?.message} 
        onClose={() => setSuspendedModal(null)} 
      />
    </AuthContext.Provider>
  );
};
