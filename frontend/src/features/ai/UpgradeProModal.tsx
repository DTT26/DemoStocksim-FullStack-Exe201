import React, { useState, useEffect } from 'react';
import { 
  X, Sparkles, Check, Zap, Shield, Crown, ArrowRight, 
  Loader2, AlertCircle, QrCode, Infinity, Flame
} from 'lucide-react';
import { subscriptionService, type SubscriptionInfo } from '../../services/subscriptionService';

interface UpgradeProModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSubscription?: SubscriptionInfo | null;
  onSuccess?: () => void;
}

export const UpgradeProModal: React.FC<UpgradeProModalProps> = ({
  isOpen,
  onClose,
  currentSubscription
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'PLUS' | 'PRO'>('PRO');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await subscriptionService.createCheckout(selectedPlan);
      if (res.success && res.checkoutUrl) {
        // Chuyển hướng người dùng sang trang thanh toán PayOS VietQR
        window.location.href = res.checkoutUrl;
      } else {
        setError(res.message || 'Không thể tạo liên kết thanh toán. Vui lòng thử lại sau.');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Lỗi kết nối máy chủ thanh toán.');
    } finally {
      setLoading(false);
    }
  };

  const currentPlan = currentSubscription?.plan || 'FREE';
  const isCurrentPaid = currentSubscription?.isPremium;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-[#131722] border border-slate-200 dark:border-[#2a2e39] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Background Glow */}
        <div className="absolute top-0 inset-x-0 h-36 bg-gradient-to-b from-amber-500/20 via-purple-500/10 to-transparent pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#252d3d] transition-all z-30 cursor-pointer shadow-xs"
          title="Đóng (ESC)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="px-6 pr-14 pt-6 pb-2 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/25 shrink-0">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Nâng Cấp Gói <span className="text-amber-500">StockSim AI Tutor</span>
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Huấn luyện viên thực chiến ICT/SMC & Chấm bài vẽ biểu đồ tự động
              </p>
            </div>
          </div>
        </div>

        {/* Plan Cards Container */}
        <div className="px-6 py-3 space-y-4 overflow-y-auto">
          {/* Active Subscription Banner if user already has PLUS / PRO */}
          {isCurrentPaid && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  Bạn đang dùng <strong>Gói {currentPlan}</strong>
                  {currentSubscription?.premiumExpiresAt && (
                    <> • Hạn đến: <strong>{new Date(currentSubscription.premiumExpiresAt).toLocaleDateString('vi-VN')}</strong></>
                  )}
                </span>
              </div>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                Cộng dồn thêm 30 ngày
              </span>
            </div>
          )}

          {/* Side-by-Side Plan Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* PLAN 1: GÓI PLUS (99k) */}
            <div 
              onClick={() => setSelectedPlan('PLUS')}
              className={`relative p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                selectedPlan === 'PLUS'
                  ? 'border-blue-500 bg-blue-500/10 dark:bg-blue-500/10 ring-2 ring-blue-500/40 shadow-md'
                  : 'border-slate-200 dark:border-[#262c3d] bg-slate-50/70 dark:bg-[#181d2a] hover:border-slate-300 dark:hover:border-[#343e57]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold tracking-wider uppercase font-mono">
                    TIẾT KIỆM
                  </span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    selectedPlan === 'PLUS' ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-400 dark:border-slate-600'
                  }`}>
                    {selectedPlan === 'PLUS' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-blue-500" />
                  Gói PLUS
                </h4>
                
                <div className="flex items-baseline gap-1 mt-1 mb-3">
                  <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">99.000₫</span>
                  <span className="text-xs text-slate-400">/ 30 ngày</span>
                </div>

                <div className="space-y-2 text-xs border-t border-slate-200 dark:border-[#252c3f] pt-3">
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-200">
                      <strong>300 lượt Chat AI</strong> / tháng
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-200">
                      <strong>150 bài Chấm Vẽ Biểu Đồ</strong> / tháng
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <span className="text-slate-600 dark:text-slate-300">
                      Hỏi đáp chiến lược SMC / ICT, Price Action
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <span className="text-slate-600 dark:text-slate-300">
                      Đo lường rủi ro & vị thế lệnh (Prop Firm Tool)
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                Chỉ ~3.300₫ / ngày
              </div>
            </div>

            {/* PLAN 2: GÓI PRO VIP (299k) */}
            <div 
              onClick={() => setSelectedPlan('PRO')}
              className={`relative p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                selectedPlan === 'PRO'
                  ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/10 ring-2 ring-amber-500/50 shadow-lg shadow-amber-500/10'
                  : 'border-slate-200 dark:border-[#262c3d] bg-slate-50/70 dark:bg-[#181d2a] hover:border-slate-300 dark:hover:border-[#343e57]'
              }`}
            >
              {/* Hot Ribbon */}
              <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <Flame className="w-3 h-3 fill-slate-950" />
                KHUYÊN DÙNG VIP
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold tracking-wider uppercase font-mono">
                    UNLIMITED VIP
                  </span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    selectedPlan === 'PRO' ? 'border-amber-500 bg-amber-500 text-slate-950' : 'border-slate-400 dark:border-slate-600'
                  }`}>
                    {selectedPlan === 'PRO' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-500" />
                  Gói PRO VIP
                </h4>
                
                <div className="flex items-baseline gap-1 mt-1 mb-3">
                  <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">299.000₫</span>
                  <span className="text-xs text-slate-400">/ 30 ngày</span>
                </div>

                <div className="space-y-2 text-xs border-t border-slate-200 dark:border-[#252c3f] pt-3">
                  <div className="flex items-start gap-2">
                    <Infinity className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span className="text-slate-900 dark:text-white font-bold">
                      KHÔNG GIỚI HẠN Chat AI
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Infinity className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span className="text-slate-900 dark:text-white font-bold">
                      KHÔNG GIỚI HẠN Chấm Bài Vẽ
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-200">
                      Ưu tiên băng thông cao nhất (Tốc độ phản hồi tức thì)
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-200">
                      Senior Prop Firm Risk & Hard Breach Prevention
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-200">
                      Đo lường MFE / MAE & Thống kê kỷ luật lệnh
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                Chỉ ~9.900₫ / ngày • Toàn quyền sử dụng
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Modal Footer / Action Button */}
        <div className="p-6 pt-3 border-t border-slate-200 dark:border-[#2a2e39] bg-slate-50/50 dark:bg-[#11141c]/50">
          <button
            onClick={handleCheckout}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.01] ${
              selectedPlan === 'PRO'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/25'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-blue-500/25'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang kết nối cổng PayOS...</span>
              </>
            ) : (
              <>
                <QrCode className="w-4 h-4" />
                <span>
                  {selectedPlan === 'PRO'
                    ? 'Thanh toán Gói PRO • 299.000₫ (Quét mã VietQR)'
                    : 'Thanh toán Gói PLUS • 99.000₫ (Quét mã VietQR)'
                  }
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2.5 mt-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-500" /> PayOS VietQR
            </span>
            <span>•</span>
            <span>Kích hoạt tự động tức thì</span>
            <span>•</span>
            <span>Hỗ trợ mọi App Ngân hàng & Ví điện tử</span>
          </div>
        </div>
      </div>
    </div>
  );
};
