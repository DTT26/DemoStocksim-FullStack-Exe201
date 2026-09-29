import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Sparkles, ArrowRight, ShieldCheck, Zap, Home } from 'lucide-react';
import { subscriptionService, type SubscriptionInfo } from '../../services/subscriptionService';

export const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get('orderCode');
  const [sub, setSub] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (orderCode) {
        try {
          await subscriptionService.verifyOrder(parseInt(orderCode, 10));
        } catch (err) {
          console.warn('Verify order error:', err);
        }
      }
      try {
        const res = await subscriptionService.getMySubscription();
        setSub(res);
      } catch (err) {
        console.warn('Could not refresh subscription', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [orderCode]);

  return (
    <div className="min-h-screen bg-[#080C14] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#131722] border border-[#2a2e39] rounded-3xl p-8 text-center relative overflow-hidden shadow-2xl">
        {/* Glow */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-amber-500/20 via-emerald-500/10 to-transparent pointer-events-none" />

        {/* Icon Success */}
        <div className="relative mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-xl shadow-emerald-500/25 mb-6 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold uppercase tracking-wider font-mono mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Kích hoạt thành công
        </div>

        <h1 className="text-2xl font-black text-white tracking-tight">
          Chào mừng đến với AI Tutor PRO!
        </h1>

        <p className="text-sm text-slate-400 mt-2 leading-relaxed">
          Giao dịch thanh toán PayOS đã hoàn tất. Tài khoản của bạn đã được nâng cấp lên hạng <strong className="text-amber-400">VIP PREMIUM</strong> với đầy đủ đặc quyền phân tích.
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {orderCode && (
            <div className="px-3 py-1.5 rounded-lg bg-[#1a1f2c] border border-[#262c3d] text-xs text-slate-400 font-mono">
              Mã GD: <span className="text-white font-bold">{orderCode}</span>
            </div>
          )}
          {sub?.premiumExpiresAt && (
            <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-400 font-mono">
              Hạn dùng đến: <span className="text-white font-bold">{new Date(sub.premiumExpiresAt).toLocaleDateString('vi-VN')}</span>
            </div>
          )}
        </div>

        {/* Perks Box */}
        <div className="my-6 p-4 rounded-2xl bg-[#161a24] border border-[#252c3c] text-left space-y-2 text-xs">
          <div className="flex items-center gap-2 text-slate-200">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span><strong>500 lượt hỏi AI / ngày</strong> (Hạn mức mới được áp dụng ngay)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-200">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <span><strong>Senior Prop Firm & ICT/SMC Coach Engine</strong> kích hoạt</span>
          </div>
          <div className="flex items-center gap-2 text-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>Tự động kiểm toán Hard Breach & Quản trị vốn 1%-2%</strong></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/trade/btcusdt')}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <span>Vào Trading Terminal trải nghiệm ngay</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate('/student')}
            className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1a1f2c] hover:bg-[#252c3c] text-slate-300 font-medium text-xs border border-[#2c3345] transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Về Trang chủ Học viên</span>
          </button>
        </div>
      </div>
    </div>
  );
};
