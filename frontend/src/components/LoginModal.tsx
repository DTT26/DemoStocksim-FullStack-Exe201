import { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginGoogle: (captchaToken: string) => void;
}

export const LoginModal = ({ isOpen, onClose, onLoginGoogle }: LoginModalProps) => {
  const [isVerified, setIsVerified] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>('');
  const { theme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-end pt-20 pr-6 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white dark:bg-[#1e222d] w-[400px] rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#2a2e39]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Đăng nhập</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-[#2a2e39] rounded-lg transition-colors text-gray-500 dark:text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center gap-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Vui lòng xác nhận bạn không phải là robot để tiếp tục.
            </p>
          </div>

          <div className="flex justify-center w-full min-h-[78px]">
            <ReCAPTCHA
              sitekey="6LcONsctAAAAANj0qc4XgLeCqo4WsQZzctup9WVM"
              theme={theme}
              onChange={(token) => {
                if (token) {
                  setIsVerified(true);
                  setCaptchaToken(token);
                }
                else setIsVerified(false);
              }}
              onExpired={() => setIsVerified(false)}
            />
          </div>

          <button
            disabled={!isVerified}
            onClick={() => {
              onClose();
              onLoginGoogle(captchaToken);
            }}
            className={`w-full py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
              isVerified 
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30' 
                : 'bg-gray-200 dark:bg-[#2a2e39] text-gray-400 cursor-not-allowed'
            }`}
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 grayscale-0 opacity-100" style={{ filter: isVerified ? 'none' : 'grayscale(100%) opacity(50%)' }} alt="Google" />
            <span>Tiếp tục bằng Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};
