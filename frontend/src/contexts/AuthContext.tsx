import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import { LoginModal } from '../components/LoginModal';

export interface User {
  _id: string;
  name: string;
  email: string;
  picture: string;
  role: 'student' | 'lecturer' | 'admin';
  balance?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
  refreshUser: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>('');

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

  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const res = await fetch(`${apiUrl}/auth/google`, { credentials: 'include',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            access_token: tokenResponse.access_token,
            captchaToken: captchaToken
          }),
        });
        const data = await res.json();
        
        if (res.ok) {
          // Backend has already set the HttpOnly cookies for token and refreshToken
          await fetchUser();
        } else {
          console.error('Backend login failed:', data.message);
        }
      } catch (err) {
        console.error('Failed to authenticate', err);
      }
    },
    onError: () => console.log('Login Failed')
  });

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
    // Also remove from localStorage in case it's still there from previous version
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser: fetchUser }}>
      {children}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onLoginGoogle={(token) => {
          setCaptchaToken(token);
          triggerGoogleLogin();
        }} 
      />
    </AuthContext.Provider>
  );
};
