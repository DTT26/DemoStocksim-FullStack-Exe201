import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

export const PaymentCancel: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#080C14] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#131722] border border-[#2a2e39] rounded-3xl p-8 text-center relative overflow-hidden shadow-2xl">
        {/* Glow */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-amber-500/10 via-rose-500/10 to-transparent pointer-events-none" />

        {/* Icon Cancel */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg mb-5">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <h1 className="text-xl font-bold text-white tracking-tight">
          Giao dịch thanh toán chưa hoàn tất
        </h1>

        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          Bạn đã huỷ giao dịch hoặc liên kết thanh toán đã hết hạn. Đừng lo, tài khoản của bạn chưa bị trừ tiền và bạn có thể thử lại bất cứ lúc nào!
        </p>

        {/* Buttons */}
        <div className="mt-6 space-y-3">
          <button
            onClick={() => navigate('/trade/btcusdt')}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Thử lại hoặc quay về Biểu đồ</span>
          </button>

          <button
            onClick={() => navigate('/student')}
            className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1a1f2c] hover:bg-[#252c3c] text-slate-300 font-medium text-xs border border-[#2c3345] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Về Trang chủ Học viên</span>
          </button>
        </div>
      </div>
    </div>
  );
};
