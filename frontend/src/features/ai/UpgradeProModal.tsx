import React, { useState, useEffect } from 'react';
import { 
  X, Sparkles, Check, Zap, Shield, Crown, ArrowRight, 
  Loader2, AlertCircle, ExternalLink, QrCode
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutData, setCheckoutData] = useState<{ checkoutUrl: string; qrCode?: string } | null>(null);

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
      const res = await subscriptionService.createCheckout('PREMIUM_MONTHLY');
      if (res.success && res.checkoutUrl) {
        setCheckoutData({ checkoutUrl: res.checkoutUrl, qrCode: res.qrCode });
        // Chuyển hướng người dùng sang trang thanh toán PayOS
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

  const isCurrentPro = currentSubscription?.isPremium;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-[#131722] border border-slate-200 dark:border-[#2a2e39] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Background Glow */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-amber-500/20 via-purple-500/10 to-transparent pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#252d3d] transition-all z-30 cursor-pointer pointer-events-auto shadow-xs"
          title="Đóng (ESC)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="px-6 pr-14 pt-6 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/25 shrink-0">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  StockSim AI Tutor <span className="text-amber-500">PRO</span>
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-400 text-[10px] font-bold tracking-wider uppercase font-mono">
                  VIP PLAN
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Mở khóa toàn bộ năng lực phân tích của Huấn luyện viên AI chuyên nghiệp
              </p>
            </div>
          </div>
        </div>

        {/* Price & Features */}
        <div className="px-6 py-2 space-y-4 overflow-y-auto max-h-[70vh]">
          {/* Price Box */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-purple-500/5 to-blue-500/10 border border-amber-500/30 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Gói 30 Ngày Không Giới Hạn</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">99.000₫</span>
                <span className="text-xs text-slate-400 font-normal">/ 30 ngày</span>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
                Chỉ ~3.300₫ / ngày
              </span>
            </div>
          </div>

          {/* Feature List */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Đặc quyền gói PRO
            </h4>
            
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-[#1a1f2c] border border-slate-200 dark:border-[#262c3d]">
                <div className="p-1 rounded bg-amber-500/20 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">500 lượt hỏi AI mỗi ngày</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Thoải mái trò chuyện, hỏi đáp liên tục (Gói Free chỉ 10 lượt/ngày).</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-[#1a1f2c] border border-slate-200 dark:border-[#262c3d]">
                <div className="p-1 rounded bg-purple-500/20 text-purple-500 dark:text-purple-400 shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Senior Prop Firm & ICT/SMC Coach Engine</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Phân tích chuyên sâu FVG, Liquidity Pools, Breaker Block & cấu trúc đa khung.</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-[#1a1f2c] border border-slate-200 dark:border-[#262c3d]">
                <div className="p-1 rounded bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Kiểm toán Rủi ro Quỹ (Hard Breach Prevention)</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Function Calling đo lường Daily Loss, Sụt giảm tối đa (Max Drawdown) tự động.</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-[#1a1f2c] border border-slate-200 dark:border-[#262c3d]">
                <div className="p-1 rounded bg-blue-500/20 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Đo lường MFE / MAE & Chấm điểm kỷ luật</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Review từng lệnh giao dịch, phát hiện thói quen xấu và giao dịch trả thù.</div>
                </div>
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

          {/* Current Status Note */}
          {isCurrentPro && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400">
                <Crown className="w-4 h-4 shrink-0" />
                <span>Bạn đang kích hoạt gói PRO VIP (500 lượt/ngày)</span>
              </div>
              {currentSubscription?.premiumExpiresAt && (
                <div className="text-[11px] text-slate-600 dark:text-slate-300 font-mono pl-6">
                  Hạn sử dụng đến: <strong className="text-slate-900 dark:text-white">{new Date(currentSubscription.premiumExpiresAt).toLocaleString('vi-VN')}</strong>
                </div>
              )}
              <div className="text-[11px] text-slate-500 dark:text-slate-400 pl-6">
                Khi thanh toán gói tiếp theo, hệ thống sẽ tự động cộng dồn thêm <strong>30 ngày</strong> vào hạn dùng trên.
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Action Button */}
        <div className="p-6 pt-4 border-t border-slate-200 dark:border-[#2a2e39] bg-slate-50/50 dark:bg-[#11141c]/50">
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.01]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang kết nối cổng PayOS...</span>
              </>
            ) : (
              <>
                <QrCode className="w-4 h-4" />
                <span>{isCurrentPro ? 'Gia hạn thêm 30 ngày • Quét mã QR PayOS' : 'Nâng cấp ngay • Quét mã QR PayOS'}</span>
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
          </div>
        </div>
      </div>
    </div>
  );
};
