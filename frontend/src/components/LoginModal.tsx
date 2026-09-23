import { useState } from 'react';
import { X, ShieldCheck, Loader2 } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginGoogle: (captchaToken: string) => void;
}

export const LoginModal = ({ isOpen, onClose, onLoginGoogle }: LoginModalProps) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LehIsstAAAAADEZTd4iD4LQ3MNfhJAAQjFVq1FH';
      let token = '';

      if (typeof window !== 'undefined' && (window as any).grecaptcha) {
        token = await new Promise<string>((resolve) => {
          (window as any).grecaptcha.ready(async () => {
            try {
              const res = await (window as any).grecaptcha.execute(siteKey, { action: 'login' });
              resolve(res || '');
            } catch (err) {
              console.error('reCAPTCHA execute error:', err);
              resolve('');
            }
          });
        });
      } else {
        console.warn('grecaptcha not found on window, continuing without token');
      }

      onClose();
      onLoginGoogle(token);
    } catch (err: any) {
      console.error('Login process failed:', err);
      setErrorMsg('Không thể xác thực bảo mật. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-white dark:bg-[#1e222d] w-full max-w-[420px] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 dark:border-[#2a2e39]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-[#2a2e39]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Đăng nhập tài khoản</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">StockSim Trading Platform</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#2a2e39] rounded-lg transition-colors text-gray-500 dark:text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center gap-6">
          <div className="text-center space-y-1.5">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Đăng nhập an toàn &amp; nhanh chóng
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
              Trang web được bảo vệ tự động bằng Google reCAPTCHA v3. Bạn không cần giải câu đố hay click ô xác thực.
            </p>
          </div>

          {errorMsg && (
            <div className="w-full p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs text-center">
              {errorMsg}
            </div>
          )}

          <button
            disabled={loading}
            onClick={handleGoogleLogin}
            className="w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white shadow-lg shadow-blue-500/25 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Đang xử lý bảo mật...</span>
              </>
            ) : (
              <>
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                <span>Tiếp tục bằng Google</span>
              </>
            )}
          </button>

          <div className="text-[11px] text-gray-400 dark:text-gray-500 text-center leading-normal">
            Bảo vệ bởi <span className="font-semibold text-gray-600 dark:text-gray-400">reCAPTCHA v3</span> • Áp dụng{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="underline hover:text-blue-500">
              Chính sách quyền riêng tư
            </a>{' '}
            &amp;{' '}
            <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className="underline hover:text-blue-500">
              Điều khoản
            </a>{' '}
            của Google.
          </div>
        </div>
      </div>
    </div>
  );
};
