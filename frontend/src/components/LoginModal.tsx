import { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Loader2, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  Check, 
  ArrowRight, 
  KeyRound, 
  RefreshCw, 
  ChevronLeft,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginGoogle: (captchaToken: string) => void;
}

type AuthTab = 'login' | 'register';
type RegisterStep = 'form' | 'otp';

export const LoginModal = ({ isOpen, onClose, onLoginGoogle }: LoginModalProps) => {
  const { loginWithEmail, registerRequest, verifyOtp, resendOtp } = useAuth();

  const [tab, setTab] = useState<AuthTab>('login');
  const [registerStep, setRegisterStep] = useState<RegisterStep>('form');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regTermsAccepted, setRegTermsAccepted] = useState(false);

  const [otpCode, setOtpCode] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [suggestedDevOtp, setSuggestedDevOtp] = useState<string | null>(null);

  // Reset state when opening/closing modal
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setSuccessMsg('');
      setLoading(false);
    }
  }, [isOpen]);

  // Timer for OTP resend countdown
  useEffect(() => {
    let timer: any;
    if (registerStep === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [registerStep, countdown]);

  if (!isOpen) return null;

  // Lấy reCAPTCHA v3 Token ngầm
  const getRecaptchaToken = async (action: string): Promise<string> => {
    try {
      const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LehIsstAAAAADEZTd4iD4LQ3MNfhJAAQjFVq1FH';
      if (typeof window !== 'undefined' && (window as any).grecaptcha) {
        return await new Promise<string>((resolve) => {
          (window as any).grecaptcha.ready(async () => {
            try {
              const res = await (window as any).grecaptcha.execute(siteKey, { action });
              resolve(res || '');
            } catch (err) {
              console.error('reCAPTCHA execute error:', err);
              resolve('');
            }
          });
        });
      }
      return '';
    } catch {
      return '';
    }
  };

  // 1. Xử lý Đăng nhập Google
  const handleGoogleClick = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const token = await getRecaptchaToken('google_login');
      onClose();
      onLoginGoogle(token);
    } catch (err: any) {
      setErrorMsg('Không thể khởi tạo đăng nhập Google. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Xử lý Đăng nhập Email & Mật khẩu
  const handleEmailLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) {
      setErrorMsg('Vui lòng điền đầy đủ Email và Mật khẩu.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const captchaToken = await getRecaptchaToken('login');
      const result = await loginWithEmail(loginEmail.trim(), loginPassword, captchaToken);
      if (result.success) {
        onClose();
      } else {
        setErrorMsg(result.message || 'Email hoặc mật khẩu không chính xác.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Đăng nhập không thành công.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Xử lý Đăng ký Bước 1: Gửi thông tin & nhận OTP
  const handleRegisterFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!regName.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên của bạn.');
      return;
    }
    if (!regEmail.trim()) {
      setErrorMsg('Vui lòng nhập địa chỉ email (Gmail).');
      return;
    }
    if (!hasMinLength || !hasUpper || !hasLower || !hasNum) {
      setErrorMsg('Mật khẩu chưa đáp ứng đầy đủ yêu cầu bảo mật.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (!regTermsAccepted) {
      setErrorMsg('Vui lòng tick chọn đồng ý với Điều khoản dịch vụ & Chính sách của sàn.');
      return;
    }

    setLoading(true);
    try {
      const captchaToken = await getRecaptchaToken('register');
      const result = await registerRequest(regName.trim(), regEmail.trim(), regPassword, regTermsAccepted, captchaToken);

      if (result.success) {
        setRegisterStep('otp');
        setCountdown(60);
        setCanResend(false);
        setOtpCode('');
        if (result.devOtp) {
          setSuggestedDevOtp(result.devOtp);
        }
        setSuccessMsg(result.message || 'Mã OTP đã được gửi về email của bạn.');
      } else {
        setErrorMsg(result.message || 'Không thể gửi yêu cầu đăng ký.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Đã có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Xử lý Đăng ký Bước 2: Xác thực mã OTP
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length < 6) {
      setErrorMsg('Vui lòng nhập đủ 6 chữ số mã OTP.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const result = await verifyOtp(regEmail.trim(), otpCode.trim());
      if (result.success) {
        onClose();
      } else {
        setErrorMsg(result.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Xác thực OTP thất bại.');
    } finally {
      setLoading(false);
    }
  };

  // 5. Gửi lại mã OTP
  const handleResendOtp = async () => {
    if (!canResend || loading) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const result = await resendOtp(regEmail.trim());
      if (result.success) {
        setCountdown(60);
        setCanResend(false);
        if (result.devOtp) {
          setSuggestedDevOtp(result.devOtp);
        }
        setSuccessMsg('Đã gửi lại mã OTP mới vào email của bạn.');
      } else {
        setErrorMsg(result.message || 'Không thể gửi lại mã OTP.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi gửi lại OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra tiêu chuẩn mật khẩu
  const hasMinLength = regPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(regPassword);
  const hasLower = /[a-z]/.test(regPassword);
  const hasNum = /[0-9]/.test(regPassword);
  const isMatch = regConfirmPassword.length > 0 && regPassword === regConfirmPassword;

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200" 
      onClick={onClose}
    >
      <div 
        className="bg-[#111827] w-full max-w-[460px] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-[#253047] animate-in zoom-in-95 duration-200 max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-[#253047] flex items-center justify-between bg-[#172033]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">StockSim Authentication</h2>
              <p className="text-[11px] text-slate-400">Nền tảng giao dịch mô phỏng chứng khoán</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-[#253047] rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation (Đăng nhập / Đăng ký) */}
        <div className="flex border-b border-[#253047] bg-[#0c1220]">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-3 text-sm font-bold transition-all border-b-2 text-center ${
              tab === 'login'
                ? 'border-indigo-500 text-indigo-400 bg-[#172033]/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setRegisterStep('form');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-3 text-sm font-bold transition-all border-b-2 text-center ${
              tab === 'register'
                ? 'border-indigo-500 text-indigo-400 bg-[#172033]/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            Đăng ký tài khoản
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(92vh-130px)] space-y-4">
          
          {/* Thông báo Lỗi */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Thông báo Thành công */}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2 animate-in fade-in">
              <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ======================= TAB 1: ĐĂNG NHẬP ======================= */}
          {tab === 'login' && (
            <form onSubmit={handleEmailLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tài khoản Email / Gmail <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#172033] border border-[#253047] rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Mật khẩu <span className="text-rose-400">*</span>
                  </label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#172033] border border-[#253047] rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-60 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>Đăng nhập</span>
              </button>

              {/* Đường phân cách */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#253047]"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#111827] px-3 text-slate-500 font-semibold tracking-wider">
                    Hoặc đăng nhập bằng
                  </span>
                </div>
              </div>

              {/* Nút Đăng nhập Google */}
              <button
                type="button"
                disabled={loading}
                onClick={handleGoogleClick}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-3 transition-all bg-[#172033] hover:bg-[#1e2a42] border border-[#253047] text-white cursor-pointer active:scale-[0.99]"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                <span>Tiếp tục bằng Google</span>
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-400">
                  Chưa có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setTab('register');
                      setRegisterStep('form');
                    }}
                    className="text-indigo-400 hover:text-indigo-300 font-bold"
                  >
                    Đăng ký ngay
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* ======================= TAB 2: ĐĂNG KÝ ======================= */}
          {tab === 'register' && registerStep === 'form' && (
            <form onSubmit={handleRegisterFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Họ và tên <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn A"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#172033] border border-[#253047] rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tên tài khoản (Email/Gmail) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="nguyenvana@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#172033] border border-[#253047] rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Mật khẩu <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Tối thiểu 8 ký tự (hoa, thường, số)"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#172033] border border-[#253047] rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Xác nhận lại mật khẩu <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu vừa đặt"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#172033] border border-[#253047] rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Bảng kiểm tra tiêu chuẩn mật khẩu thời gian thực */}
              <div className="p-3 bg-[#0d1424] border border-[#1e2a42] rounded-xl text-xs space-y-1.5">
                <p className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider mb-1">
                  Yêu cầu mật khẩu an toàn:
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <Check className={`w-3.5 h-3.5 ${hasMinLength ? 'text-emerald-400' : 'opacity-30'}`} />
                    <span>Tối thiểu 8 ký tự</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <Check className={`w-3.5 h-3.5 ${hasUpper ? 'text-emerald-400' : 'opacity-30'}`} />
                    <span>Có chữ in hoa (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasLower ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <Check className={`w-3.5 h-3.5 ${hasLower ? 'text-emerald-400' : 'opacity-30'}`} />
                    <span>Có chữ thường (a-z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasNum ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <Check className={`w-3.5 h-3.5 ${hasNum ? 'text-emerald-400' : 'opacity-30'}`} />
                    <span>Có chữ số (0-9)</span>
                  </div>
                </div>
                {regConfirmPassword && (
                  <div className={`flex items-center gap-1.5 pt-1 border-t border-[#1e2a42] ${isMatch ? 'text-emerald-400' : 'text-rose-400'}`}>
                    <Check className={`w-3.5 h-3.5 ${isMatch ? 'text-emerald-400' : 'opacity-30'}`} />
                    <span>{isMatch ? 'Mật khẩu xác nhận trùng khớp' : 'Mật khẩu xác nhận chưa khớp'}</span>
                  </div>
                )}
              </div>

              {/* Checkbox Đồng ý điều khoản */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="regTerms"
                  required
                  checked={regTermsAccepted}
                  onChange={(e) => setRegTermsAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-[#253047] text-indigo-600 focus:ring-indigo-500 bg-[#172033] cursor-pointer"
                />
                <label htmlFor="regTerms" className="text-xs text-slate-300 leading-relaxed cursor-pointer">
                  Tôi đồng ý tham gia và chấp thuận{' '}
                  <span className="text-indigo-400 font-semibold underline">Điều khoản dịch vụ</span> &amp;{' '}
                  <span className="text-indigo-400 font-semibold underline">Chính sách bảo mật</span> của StockSim.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !regTermsAccepted}
                className="w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] text-white shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                <span>Tiếp tục &amp; Gửi mã OTP xác nhận</span>
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-400">
                  Đã có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => setTab('login')}
                    className="text-indigo-400 hover:text-indigo-300 font-bold"
                  >
                    Đăng nhập
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* ======================= TAB 2 - BƯỚC 2: NHẬP OTP ======================= */}
          {tab === 'register' && registerStep === 'otp' && (
            <form onSubmit={handleVerifyOtpSubmit} className="space-y-5 animate-in slide-in-from-right-4 duration-300">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
                  <KeyRound className="w-6 h-6 animate-bounce" />
                </div>
                <h3 className="text-lg font-bold text-white">Xác thực mã OTP</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Mã xác thực gồm 6 chữ số đã được gửi đến email: <br />
                  <strong className="text-indigo-400 font-mono text-sm">{regEmail}</strong>
                </p>
              </div>

              {/* Dev OTP helper badge if available */}
              {suggestedDevOtp && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs text-amber-300">
                  <span>Mã OTP test nhanh: <strong className="font-mono text-sm">{suggestedDevOtp}</strong></span>
                  <button
                    type="button"
                    onClick={() => setOtpCode(suggestedDevOtp)}
                    className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 rounded font-semibold text-[11px] text-amber-200"
                  >
                    Điền nhanh
                  </button>
                </div>
              )}

              {/* Input OTP 6 số */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 text-center">
                  Nhập mã 6 số (Hiệu lực trong 10 phút)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full py-3 bg-[#172033] border-2 border-indigo-500/50 rounded-xl text-center text-2xl font-mono font-bold tracking-[10px] text-cyan-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              {/* Nút Xác nhận OTP */}
              <button
                type="submit"
                disabled={loading || otpCode.length < 6}
                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] text-white shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>Xác nhận &amp; Hoàn tất đăng ký</span>
              </button>

              {/* Nút gửi lại mã & Quay lại */}
              <div className="flex items-center justify-between pt-2 border-t border-[#253047] text-xs">
                <button
                  type="button"
                  onClick={() => setRegisterStep('form')}
                  className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Sửa thông tin</span>
                </button>

                <div>
                  {canResend ? (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleResendOtp}
                      className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                      <span>Gửi lại mã OTP</span>
                    </button>
                  ) : (
                    <span className="text-slate-500">
                      Gửi lại sau: <strong className="font-mono text-slate-400">{countdown}s</strong>
                    </span>
                  )}
                </div>
              </div>
            </form>
          )}

        </div>

        {/* Footer info badge */}
        <div className="px-6 py-3 bg-[#0d1424] border-t border-[#253047] text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>Bảo mật tự động bởi <strong className="text-slate-400">Google reCAPTCHA v3</strong></span>
        </div>
      </div>
    </div>
  );
};
